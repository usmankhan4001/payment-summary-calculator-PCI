import { getTheProductData } from "../Bitrix24HelperFunctions/getTheProductData.js";
import { fetchReadableText } from "../Bitrix24HelperFunctions/fetchReadableText.js";


// Helper: Converts image URL to Base64 for PDF embedding
async function imageToBase64(url) {
  console.log(`[ImageHelper] Converting to Base64: ${url}`);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (e) => {
      console.error(`[ImageHelper] Failed to load image: ${url}`, e);
      reject(e);
    };
    img.src = url;
  });
}

function parseCurrency(value) {
  if (!value) return 0;
  return parseFloat(value.toString().replace(/,/g, ""));
}

function validation(value) {
  if (isNaN(value)) {
    return 0;
  }
  return value;
}

function formatCurrency(value) {
  // Ensure we don't double-format if value is already a string with commas
  if (typeof value === 'string' && value.includes(',')) return `PKR ${value}`;

  // Format number
  return `PKR ${validation(value).toLocaleString("en-US")}`;
}

// Format Area
function formatArea(value) {
  if (!value) return "0 sq. ft.";
  return `${value} sq. ft.`;
}

export const generatePDFOfSummary = async () => {
  console.log("[PDF Gen] Starting PDF generation process...");

  // 1. Gather Data from DOM
  try {
    const projectSelect = document.getElementById("project-name");
    const clientNameInput = document.getElementById("client-name");
    const propertyTypeSelect = document.getElementById("property-type");
    const itemFilterSelect = document.getElementById("property-item");
    const paymentMethodSelect = document.getElementById("payment-condition");
    const grossAreaInput = document.getElementById("gross-area");

    // These are DIVs in your HTML, use .innerText or .textContent
    const totalPriceDiv = document.getElementById("summary-total-price");
    const installmentsDiv = document.getElementById("summary-installments-no");
    const downPaymentDiv = document.getElementById("summary-downpayment");
    const possessionAmtDiv = document.getElementById("summary-possession-amount");
    const installmentAmtDiv = document.getElementById("summary-remaining");
    const monthlyInstallmentDiv = document.getElementById("summary-installment"); // For the recurring amount

    // Input percentages for calculation
    const downPaymentPercInput = document.getElementById("downpayment-percentage");
    const possessionPercSelect = document.getElementById("possession-percentage");

    // Get raw text/values
    const projectName = projectSelect.options[projectSelect.selectedIndex].text;
    const clientName = clientNameInput.value;
    const propertyType = propertyTypeSelect.options[propertyTypeSelect.selectedIndex].text;
    const unitNumber = itemFilterSelect.options[itemFilterSelect.selectedIndex].text;
    const condition = paymentMethodSelect.options[paymentMethodSelect.selectedIndex].text;
    const grossArea = grossAreaInput.value;

    // FIX: Use .innerText for DIV elements
    const numberOfInstallments = parseInt(installmentsDiv.innerText) || 0;
    // Helper to clean "PKR " or "," from innerText before parsing
    const cleanAndParse = (text) => parseCurrency(text.replace(/PKR\s?|sq\.\s?ft\./gi, '').trim());

    const totalPriceRaw = cleanAndParse(totalPriceDiv.innerText);
    const dpAmount = cleanAndParse(downPaymentDiv.innerText);
    const possAmountRaw = cleanAndParse(possessionAmtDiv.innerText);
    const remainingBalance = cleanAndParse(installmentAmtDiv.innerText);
    const monthlyAmtRaw = cleanAndParse(monthlyInstallmentDiv.innerText);


    const productData = await getTheProductData(itemFilterSelect.value);

    console.log("[PDF Gen] Fetched Product Data:", productData);

    // get the property type:
    const { PROPERTY_177: propertyTypeValue, PROPERTY_139: categoryTypeValue, PROPERTY_135: floorTypeValue } = productData || {};

    // get the value of the properties:
    const propertyTypeID = propertyTypeValue ? propertyTypeValue.value : null;
    const categoryID = categoryTypeValue ? categoryTypeValue.value : null;
    const floorValue = floorTypeValue ? floorTypeValue.value : null;


    console.log(`[PDF Gen] Property Type ID: ${propertyTypeID} | Category ID: ${categoryID}`);

    const propertyTypeText = propertyTypeID ? await fetchReadableText(propertyTypeID) : "N/A";

    const categoryTypeText = categoryID ? await fetchReadableText(categoryID) : "N/A";

    const floorTypeText = floorValue ? await fetchReadableText(floorValue) : "N/A";


    console.log(`[PDF Gen] Resolved Property Type: ${propertyTypeText} | Resolved Category: ${categoryTypeText} | Resolved Floor: ${floorTypeText}`);

    console.log(`[PDF Gen] Fixed! Installments detected: ${numberOfInstallments}`);

    // Prepare the Main Data Object
    const currentCalculations = {
      projectName: projectName,
      clientName: clientName,
      propertyType: propertyTypeText,
      categoryType: categoryTypeText,
      floorType: floorTypeText,
      unitNumber: unitNumber,
      condition: condition,
      mode: 'custom-area',
      netArea: grossArea,
      totalPrice: formatCurrency(totalPriceRaw),
      numberOfInstallments: numberOfInstallments,
      monthlyInstallment: formatCurrency(monthlyAmtRaw),
      downPaymentPercent: parseCurrency(downPaymentPercInput.value),
      downPayment: formatCurrency(dpAmount),
      possessionPercent: parseCurrency(possessionPercSelect.value),
      possessionAmount: formatCurrency(possAmountRaw),
      remainingAmount: formatCurrency(remainingBalance)
    };

    console.log(
      "[PDF Gen] Current Calculations Data Object:",
      currentCalculations,
    );

    // 2. Define Assets
    const projectAssets = {
      "River Courtyard": {
        logoUrl: "https://i.postimg.cc/FHNNkXGY/River-Courtyard.png",
        imageUrl: "https://i.postimg.cc/nz0Qg1zw/river-Small.png",
      },
      "Grand Galleria": {
        logoUrl: "https://i.postimg.cc/QdhhKZS7/Grand-Gallery.png",
        imageUrl: "https://i.postimg.cc/4dBhq1dq/grand-gallery-Small.png",
      },
      "Box Park II": {
        logoUrl: "https://i.postimg.cc/7ZwwJrXG/Box-Park.png",
        imageUrl: "https://i.postimg.cc/262BMx60/box-park-II-Small.jpg",
      },
      "Roman Grove": {
        logoUrl: "https://i.postimg.cc/jSttnYvW/Roman-Grove.png",
        imageUrl: "https://i.postimg.cc/NMprSxM4/roman-grove-1-Small.jpg",
      },
      "Buraq Heights": {
        logoUrl: "https://i.postimg.cc/vZbbxwXW/Buraq-Heights.png",
        imageUrl: "https://i.postimg.cc/C1mfX41P/buraq-height-Small.png",
      },
      "Grand Orchard": {
        logoUrl: "https://i.postimg.cc/SxkkYbV8/Grand-Orchard.png",
        imageUrl:
          "https://i.postimg.cc/50nFTm0P/DHA-Orchard-Night-Shot-01-Small.jpg",
      },
      default: {
        logoUrl: "https://i.postimg.cc/SxkkYbV8/Grand-Orchard.png",
        imageUrl:
          "https://i.postimg.cc/50nFTm0P/DHA-Orchard-Night-Shot-01-Small.jpg",
      },
    };

    const assets =
      projectAssets[currentCalculations.projectName] || projectAssets.default;
    const companyLogoUrl = "https://i.postimg.cc/50n359N3/pci-logo-01-01.png";

    // 3. Initialize PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const pciBlue = "#003366";
    const pciGold = "#D4AF37";
    const textDark = "#343A40";
    const textLight = "#6C757D";
    const bgLight = "#F8F9FA";

    // --- SHARED FOOTER FUNCTION ---
    const addFooter = (docInstance) => {
      const pageCount = docInstance.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        docInstance.setPage(i);
        const footerY = pageH - 10;

        // Blue Line
        docInstance.setDrawColor(pciBlue);
        docInstance.setLineWidth(0.5);
        docInstance.line(15, footerY - 5, pageW - 15, footerY - 5);

        // Left Text (Company Name + Website)
        docInstance.setFontSize(8);
        docInstance.setFont("helvetica", "normal");
        docInstance.setTextColor(textDark);
        docInstance.text("Premier Choice International", 15, footerY);
        docInstance.text("www.premierchoiceint.com", 15, footerY + 4);

        // Right Text (Email + Phone)
        const rightX = pageW - 15;
        docInstance.text("Email: info@premierchoiceint.com", rightX, footerY, { align: "right" });
        docInstance.text("Phone: +92 331 1111 919", rightX, footerY + 4, { align: "right" });
      }
    };


    console.log("[PDF Gen] Drawing Page 1...");

    // --- PAGE 1: TITLE PAGE ---
    let currentY = 15;
    try {
      const premierLogoBase64 = await imageToBase64(companyLogoUrl);
      doc.addImage(premierLogoBase64, "PNG", 15, currentY, 80, 20);
    } catch (e) {
      console.warn("[PDF Gen] Skipping Company Logo due to error");
    }

    try {
      const projectLogoBase64 = await imageToBase64(assets.logoUrl);
      doc.addImage(projectLogoBase64, "PNG", pageW - 70, currentY, 55, 25);
    } catch (e) {
      console.warn("[PDF Gen] Skipping Project Logo due to error");
    }

    currentY += 40;

    // --- HEADER INFO SECTION (Using autoTable for alignment) ---
    const quoteNum = `PCI-${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateIssued = new Date().toLocaleDateString("en-GB");

    doc.autoTable({
      startY: currentY,
      theme: 'plain',
      body: [
        [
          { content: "Prepared for", styles: { fontSize: 10, textColor: textLight } },
          { content: "Summary #", styles: { fontSize: 10, textColor: textLight, halign: 'right' } }
        ],
        [
          { content: currentCalculations.clientName || "Valued Client", styles: { fontSize: 12, textColor: textDark, fontStyle: 'bold' } },
          { content: quoteNum, styles: { fontSize: 11, textColor: textDark, fontStyle: 'bold', halign: 'right' } }
        ],
        [
          { content: `Project: ${currentCalculations.projectName}`, styles: { fontSize: 11, textColor: textDark } },
          { content: "Date Issued:", styles: { fontSize: 10, textColor: textLight, halign: 'right' } }
        ],
        [
          { content: `Property Type: ${currentCalculations.propertyType}`, styles: { fontSize: 11, textColor: textDark } },
          { content: dateIssued, styles: { fontSize: 11, textColor: textDark, halign: 'right' } }
        ]
      ],
      styles: { cellPadding: 1, overflow: 'visible' },
      columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 'auto' } },
      margin: { left: 15, right: 15 }
    });

    currentY = doc.autoTable.previous.finalY + 10;

    try {
      const projectImageBase64 = await imageToBase64(assets.imageUrl);
      doc.addImage(projectImageBase64, "JPEG", 15, currentY, pageW - 30, 80);
    } catch (e) {
      console.warn("[PDF Gen] Skipping Project Image due to error");
    }

    currentY += 80 + 15;

    // --- DETAILS SECTION (Using autoTable for Side-by-Side Layout) ---

    const projectDetailsContent = [
      `Project: ${currentCalculations.projectName}`,
      `Unit Type: ${currentCalculations.propertyType}`,
      `Payment Plan: ${currentCalculations.condition}`
    ].join("\n");

    const unitDetailsContent = [
      `Unit Number: ${currentCalculations.unitNumber}`,
      `Floor / Type: ${currentCalculations.floorType} / ${currentCalculations.propertyType}`,
      `Total Area: ${formatArea(currentCalculations.netArea)}`,
    ].join("\n");

    doc.autoTable({
      startY: currentY,
      theme: 'plain',
      head: [
        [
          { content: "Project Details", styles: { fontSize: 16, fontStyle: 'bold', textColor: pciBlue } },
          { content: "Unit Details", styles: { fontSize: 16, fontStyle: 'bold', textColor: pciBlue } }
        ]
      ],
      body: [
        [
          { content: projectDetailsContent, styles: { fontSize: 10, textColor: textDark, cellPadding: 5 } },
          { content: unitDetailsContent, styles: { fontSize: 10, textColor: textDark, cellPadding: 5 } }
        ]
      ],
      columnStyles: {
        0: { cellWidth: (pageW - 40) / 2, valign: 'top' },
        1: { cellWidth: (pageW - 40) / 2, valign: 'top', cellPadding: { left: 10 } }
      },
      styles: { overflow: 'linebreak', minCellHeight: 30 },
      // Draw vertical line manually afterward
      didDrawPage: (data) => {
        const dividerX = pageW / 2;
        const startY = data.settings.startY;
        const endY = data.cursor.y;
        doc.setDrawColor(pciBlue);
        doc.setLineWidth(0.5);
        doc.line(dividerX, startY, dividerX, endY);
      },
      margin: { left: 15, right: 15 }
    });


    // --- PAGE 2: SUMMARY & SCHEDULE ---
    console.log("[PDF Gen] Drawing Page 2...");
    doc.addPage();
    const pageW2 = doc.internal.pageSize.getWidth();

    // Header Background
    doc.setFillColor(pciBlue).rect(0, 0, pageW2, 40, "F");

    // Header Text
    doc.setFontSize(24).setFont("helvetica", "bold").setTextColor("#FFFFFF");
    doc.text("Investment Summary", pageW2 - 15, 28, { align: "right" });

    // Summary Table (Recap of Page 1 info)
    doc.autoTable({
      startY: 50,
      theme: "plain",
      body: [
        [
          {
            content: "PREPARED FOR",
            styles: { textColor: textLight, fontSize: 10 },
          },
          {
            content: "SUMMARY #",
            styles: { halign: "right", textColor: textLight, fontSize: 10 },
          },
        ],
        [
          {
            content: currentCalculations.clientName || "Valued Client",
            styles: { textColor: textDark, fontStyle: "bold", fontSize: 12 },
          },
          {
            content: quoteNum,
            styles: {
              halign: "right",
              textColor: textDark,
              fontStyle: "bold",
              fontSize: 11,
            },
          },
        ],
      ],
      margin: { left: 15, right: 15 }
    });

    // Schedule Table Construction
    console.log("[PDF Gen] Building Table Body...");
    const tableBody = [];
    tableBody.push([
      "1",
      `Investment for ${currentCalculations.projectName}\nUnit: ${currentCalculations.unitNumber}`,
      formatArea(currentCalculations.netArea),
      currentCalculations.totalPrice,
    ]);

    const isInstallment = currentCalculations.condition
      .toLowerCase()
      .includes("installment");

    if (isInstallment) {
      for (let i = 1; i <= currentCalculations.numberOfInstallments; i++) {
        tableBody.push([
          "",
          `Installment #${i}`,
          "",
          currentCalculations.monthlyInstallment,
        ]);
      }
    }

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      head: [["#", "DESCRIPTION", "DIMENSIONS", "AMOUNT"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: pciBlue, textColor: "#FFFFFF" },
      columnStyles: {
        0: { cellWidth: 10 },
        2: { halign: 'center' },
        3: { halign: "right" }
      },
      margin: { left: 15, right: 15 }
    });

    // Totals Table
    console.log("[PDF Gen] Rendering Totals section...");
    let totalsBody = [];
    if (isInstallment) {
      totalsBody = [
        ["Total Price:", currentCalculations.totalPrice],
        [
          `Down Payment (${currentCalculations.downPaymentPercent}%):`,
          currentCalculations.downPayment,
        ],
        [
          `On Possession (${currentCalculations.possessionPercent}%):`,
          currentCalculations.possessionAmount,
        ],
        ["Remaining For Installments:", currentCalculations.remainingAmount],
      ];
    } else {
      totalsBody = [["Grand Total:", currentCalculations.totalPrice]];
    }

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 8,
      theme: "plain",
      body: totalsBody,
      margin: { left: 100, right: 15 },
      columnStyles: {
        0: { fontStyle: "bold", halign: "right" },
        1: { halign: "right" },
      },
    });

    // --- DISCLAIMER (Bottom of Last Page) ---
    const disclaimerY = doc.internal.pageSize.getHeight() - 40; // Above footer

    // Gold Line
    doc.setDrawColor(pciGold);
    doc.setLineWidth(1);
    doc.line(15, disclaimerY, pageW - 15, disclaimerY);

    // Text
    doc.setFontSize(8).setTextColor(textLight).setFont("helvetica", "normal");
    doc.text("This is a computer-generated document. Prices are subject to change.", pageW / 2, disclaimerY + 5, { align: "center" });

    // Tagline
    doc.setFontSize(10).setTextColor(pciBlue).setFont("helvetica", "bold");
    doc.text("Premier Choice International | Inspiring Lifestyle", pageW / 2, disclaimerY + 10, { align: "center" });


    // --- APPLY FOOTER TO ALL PAGES ---
    addFooter(doc);

    console.log("[PDF Gen] Saving PDF...");

    return doc;

  } catch (err) {
    console.error("[PDF Gen] FATAL ERROR during generation:", err);
  }
};
