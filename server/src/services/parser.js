const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function parseResume(file) {
  const { mimetype, buffer, originalname } = file;

  if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    return data.text.trim();
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    originalname.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

module.exports = { parseResume };
