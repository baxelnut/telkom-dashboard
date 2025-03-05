import * as XLSX from "xlsx";

export async function readFile(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        const arrayBuffer = event.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        resolve(XLSX.utils.sheet_to_json(worksheet));
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(blob);
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
}
