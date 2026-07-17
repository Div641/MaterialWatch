import axios from "axios";
import {PDFParse} from "pdf-parse";

//1st downloading the pdf from imagekit cloud url
const downloadPDF = async (url) => {
    const response = await axios.get(url, {
        responseType: "arraybuffer",
    });
    return Buffer.from(response.data);
};


//then extracting text from the downloaded pdf using pdf-parse
const extractText = async (buffer) => {
    const parser = new PDFParse({ data: buffer });  // Instantiate the PDFParse class, passing the buffer to the 'data' option
    const data = await parser.getText();  // Call the getText method to extract the text content
    await parser.destroy();
    return data.text;
};


//Main service which will take imagekit url and return extracted text
//this is the final function that is exported
export const processPDF = async (url) => {
    const buffer = await downloadPDF(url);
    const text = await extractText(buffer);
    return text;
};

