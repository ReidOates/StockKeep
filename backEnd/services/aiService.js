const fetch = require('node-fetch');

/**
 * AI Smart Scan - Menggunakan Manual HTTP Fetch dengan sistem pembersihan (Robust Cleaning).
 */
exports.analyzeInventoryContent = async (textData) => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Daftar model yang terbukti aktif di akun user (Berurutan)
    const modelNames = [
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-pro-latest"
    ];
    
    const versions = ["v1beta", "v1"];
    let lastError = null;

    for (const version of versions) {
        for (const modelName of modelNames) {
            try {
                const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;
                console.log(`Manual Attempt [${version}] -> ${modelName}...`);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `
                                TUGAS: Ekstrak daftar barang dari teks berikut ke dalam JSON ARRAY.
                                
                                ATURAN:
                                1. Gunakan field: "name", "category", "price", "stock".
                                2. "price" & "stock" harus bertipe NUMBER (angka saja).
                                3. Jawab HANYA dengan JSON array. Jangan ada teks penjelasan.
                                
                                TEKS INPUT:
                                ${textData}
                                `
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.1,
                            topK: 1,
                            topP: 1
                        }
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    console.log(`SUCCESS! Model ${modelName} (${version}) merespons.`);
                    let text = data.candidates[0].content.parts[0].text;
                    
                    // --- SISTEM PEMBERSIHAN ROBUST ---
                    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
                    
                    const jsonMatch = text.match(/\[[\s\S]*\]/);
                    if (!jsonMatch) {
                        console.error("Gagal menemukan pola JSON array di respon AI.");
                        throw new Error("AI merespons dengan format teks, bukan data tabel.");
                    }

                    const cleanJson = jsonMatch[0].trim();
                    try {
                        const parsedData = JSON.parse(cleanJson);
                        console.log(`Berhasil mengekstrak ${parsedData.length} item.`);
                        return parsedData;
                    } catch (parseErr) {
                        console.error("Gagal melakukan JSON.parse pada teks bersih.");
                        throw new Error("Struktur data AI cacat/rusak.");
                    }
                } else {
                    const errorMsg = data.error?.message || response.statusText;
                    const statusCode = response.status;
                    console.warn(`Model ${modelName} (${version}) gagal [${statusCode}]: ${errorMsg}`);
                    
                    // JIKA ERROR 404, 503 (High Demand), atau 429 (Rate Limit):
                    // Kita akan LANJUT mencoba model berikutnya (Retry)
                    if (statusCode === 404 || statusCode === 503 || statusCode === 429) {
                        console.log(`Mencoba model alternatif karena model saat ini ${statusCode === 503 ? 'sibuk' : 'tidak tersedia'}...`);
                        lastError = errorMsg;
                        continue; 
                    }
                    
                    // Jika error lain (seperti 400 Bad Request), kita stop
                    throw new Error(`Google API Error (${statusCode}): ${errorMsg}`);
                }
            } catch (err) {
                // SANGAT PENTING: Jika kita sudah sukses HTTP (Status 200) tapi gagal di parsing, 
                // kita harus STOP dan melaporkan error parsing tersebut.
                if (err.message.includes("AI merespons dengan format teks") || err.message.includes("Struktur data AI cacat")) {
                    console.error("KRITIKAL: Gagal memproses konten dari model yang SUKSES merespons.");
                    throw err;
                }

                // Jika error adalah 404/503/429 yang diterjemahkan ke pesan teks
                if (err.message.includes("404") || err.message.includes("503") || err.message.includes("429") || err.message.includes("not found")) {
                    lastError = err.message;
                    continue; 
                }
                
                throw err;
            }
        }
    }

    throw new Error(`Semua model gagal atau sedang sibuk. Silakan tunggu 10 detik lalu coba lagi. Pesan terakhir: ${lastError}`);
};
