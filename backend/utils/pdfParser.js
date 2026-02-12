const pdfParse = require('pdf-parse');

module.exports.parsePDF = async (buffer) => {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        throw new Error('PDF parsing failed');
    }
};