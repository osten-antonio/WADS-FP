import { ingestionImage, ingestionResponse, ingestionText } from "../schemas/ingestion.schema";
import axios from 'axios';
import FormData from 'form-data';


type IngestionResult = {
	question: string;
};


async function performOCR(buffer: Buffer, mimetype: string): Promise<string> {
  try {
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'equation.png',
      contentType: mimetype, 
    });

    const baseUrl = process.env.NOUGAT_URL;
    if (!baseUrl) {
      throw new Error('NOUGAT_URL is not defined in .env');
    }
    const ocr_url = baseUrl.endsWith('/') ? `${baseUrl}predict/` : `${baseUrl}/predict/`;

    const response = await axios.post(ocr_url, form, {
      headers: { ...form.getHeaders() },
    });

    return typeof response.data === 'string' ? response.data : response.data.text ?? JSON.stringify(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('OCR Request Failed:', error.response?.data || error.message);
    } else {
      console.error('Conversion Error:', error);
    }
    throw new Error('Failed to perform OCR');
  }
}


export async function processImageUpload(file: Express.Multer.File): Promise<IngestionResult> {
  // validate file using zod schema (ingestionImage expects an array shape)
	try{
		ingestionImage.parse({ image: [file] });

		const buffer = file.buffer;
		if (!buffer) throw new Error("Uploaded file missing buffer");

		const ocrText = await performOCR(buffer, file.mimetype);
		console.log(ocrText);
		
		const validated = ingestionResponse.parse({ question: ocrText });
		return { question: validated.question };
	} catch (error) {
		console.error('Error processing image upload:', error);
		throw new Error('Failed to process image upload');
	}

}

// TODO security stuff here
export async function processTextUpload(text: string, _candidateCategory?: string): Promise<IngestionResult> {

	const validated = ingestionText.parse({ question: text });
	return { question: validated.question };
}
