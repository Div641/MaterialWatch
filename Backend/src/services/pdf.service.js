import axios from "axios";
import pdf from "pdf-parse";

//1st downloading the pdf from imagekit cloud url
const downloadPDF = async (url) => {
    const response = await axios.get(url, {
        responseType: "arraybuffer",
    });
    return Buffer.from(response.data);
};


//then extracting text from the downloaded pdf using pdf-parse
const extractText = async (buffer) => {
    const data = await pdf(buffer);
    return data.text;
};


//Main service which will take imagekit url and return extracted text
//this is the final function that is exported
export const processPDF = async (url) => {
    const buffer = await downloadPDF(url);
    const text = await extractText(buffer);
    return text;
};

