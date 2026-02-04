import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Función para exportar a Excel
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Datos') => {
  try {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Convertir los datos a una hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generar el archivo y descargarlo
    XLSX.writeFile(wb, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    return false;
  }
};

// Función para exportar a PDF
export const exportToPDF = (
  data: any[], 
  columns: { header: string; dataKey: string }[], 
  filename: string,
  title: string
) => {
  try {
    const doc = new jsPDF();
    
    // Configurar fuente y título
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    // Agregar fecha de generación
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 28);
    
    // Generar la tabla
    autoTable(doc, {
      startY: 35,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey] || '-')),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [212, 175, 55] }, // Color dorado
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 35 },
    });
    
    // Guardar el PDF
    doc.save(`${filename}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    return false;
  }
};

// Función para exportar con opción de formato
export const exportData = (
  data: any[],
  columns: { header: string; dataKey: string }[],
  filename: string,
  title: string,
  format: 'excel' | 'pdf' | 'both' = 'both'
) => {
  const results = {
    excel: false,
    pdf: false,
  };

  if (format === 'excel' || format === 'both') {
    // Preparar datos para Excel
    const excelData = data.map(row => {
      const obj: any = {};
      columns.forEach(col => {
        obj[col.header] = row[col.dataKey] || '-';
      });
      return obj;
    });
    results.excel = exportToExcel(excelData, filename, title);
  }

  if (format === 'pdf' || format === 'both') {
    results.pdf = exportToPDF(data, columns, filename, title);
  }

  return results;
};
