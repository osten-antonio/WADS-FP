import { ingestionImage, ingestionResponse, ingestionText } from "../schemas/ingestion.schema";
import axios from 'axios';
import { PDFDocument } from 'pdf-lib';
import FormData from 'form-data';


type IngestionResult = {
	question: string;
};

async function convertImageToPdf(imageBuffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  let image;
  const isPng = imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50;
  const isJpg = imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8;

  if (isPng) {
    image = await pdfDoc.embedPng(imageBuffer);
  } else if (isJpg) {
    image = await pdfDoc.embedJpg(imageBuffer);
  } else {
    throw new Error('Unsupported image format.');
  }

  const page = pdfDoc.addPage([612, 792]);

  const maxWidth = 500;
  const maxHeight = 700;
  let scale = Math.min(maxWidth / image.width, maxHeight / image.height);


  if (scale > 1) scale = 1; 

  const imgWidth = image.width * scale;
  const imgHeight = image.height * scale;


  const x = (page.getWidth() - imgWidth) / 2;
  const y = (page.getHeight() - imgHeight) / 2;

  page.drawImage(image, {
    x: x,
    y: y,
    width: imgWidth,
    height: imgHeight,
  });

  return Buffer.from(await pdfDoc.save());
}

async function performOCR(buffer: Buffer): Promise<string> {
  try {
    const pdfBuffer = await convertImageToPdf(buffer);


    const form = new FormData();

    form.append('file', pdfBuffer, {
      filename: 'document.pdf',
      contentType: 'application/pdf',
    });

    const baseUrl = process.env.NOUGAT_URL;
    if (!baseUrl) {
        throw new Error('NOUGAT_URL is not defined in .env');
    }
    const ocr_url = baseUrl.endsWith('/') ? `${baseUrl}predict/` : `${baseUrl}/predict/`;
    console.log(ocr_url);
    const response = await axios.post(
      ocr_url,
      form,
      {
        headers: {
          ...form.getHeaders(),
        }
      }
    );

    console.log("OCR Response");
    console.log(response);

    // TODO check response data
    return response.data.text || JSON.stringify(response.data);

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

		const ocrText = await performOCR(buffer);
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
