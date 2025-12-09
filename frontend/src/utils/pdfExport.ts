import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, filename: string = 'fraud-analysis-report.pdf') => {
  try {
    // Get the element to export
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Temporarily remove any hover effects and transitions for clean capture
    const originalTransition = element.style.transition;
    element.style.transition = 'none';

    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc', // Match the background
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Restore transition
    element.style.transition = originalTransition;

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png');

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Alternative: Export with custom formatting
export const exportReportToPDF = async (
  executiveSummary: string,
  insights: any[],
  predictions: any[],
  filename: string = 'fraud-analysis-report.pdf'
) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add page if needed
    const checkAddPage = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
    };

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fraud Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Generated: ${date}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Executive Summary Section
    checkAddPage(20);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 15, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const summaryLines = pdf.splitTextToSize(executiveSummary || 'No summary available', pageWidth - 30);
    summaryLines.forEach((line: string) => {
      checkAddPage(7);
      pdf.text(line, 15, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Key Metrics Section
    checkAddPage(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Metrics', 15, yPosition);
    yPosition += 8;

    const totalClaims = predictions.length;
    const fraudClaims = predictions.filter((p: any) => p.is_fraud_predicted).length;
    const fraudRate = ((fraudClaims / totalClaims) * 100).toFixed(1);
    const amountAtRisk = predictions
      .filter((p: any) => p.is_fraud_predicted)
      .reduce((sum: number, p: any) => sum + (p.claim_amount || 0), 0);
    const highRiskClaims = predictions.filter(
      (p: any) => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL'
    ).length;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Claims Analyzed: ${totalClaims.toLocaleString()}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Fraudulent Claims Detected: ${fraudClaims.toLocaleString()} (${fraudRate}%)`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Amount at Risk: $${(amountAtRisk / 1000).toFixed(0)}K`, 20, yPosition);
    yPosition += 6;
    pdf.text(`High Risk Claims: ${highRiskClaims.toLocaleString()}`, 20, yPosition);
    yPosition += 12;

    // Insights Section
    if (insights && insights.length > 0) {
      checkAddPage(20);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Insights', 15, yPosition);
      yPosition += 8;

      insights.slice(0, 5).forEach((insight: any, idx: number) => {
        checkAddPage(15);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${idx + 1}. ${insight.title}`, 20, yPosition);
        yPosition += 5;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const descLines = pdf.splitTextToSize(insight.description, pageWidth - 35);
        descLines.forEach((line: string) => {
          checkAddPage(5);
          pdf.text(line, 25, yPosition);
          yPosition += 4;
        });
        yPosition += 3;
      });
    }

    // Footer on last page
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text(
        `Page ${i} of ${totalPages} | Fraud Detection System - AI-Powered Analysis`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
