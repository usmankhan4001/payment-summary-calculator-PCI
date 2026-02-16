import { callBX24Method } from "../Bitrix24HelperFunctions/callBX24Method.js";

/**
 * Converts a File or Blob object to a Base64 string (raw content only)
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    if (!(blob instanceof Blob)) {
      return reject(
        new TypeError(
          "The provided 'file' is not a valid Blob or File object.",
        ),
      );
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};

export const attachFileToLead = async (leadId, file) => {
  const FILE_FIELD = "ufCrm_1758688640" // Ensure case sensitivity matches your B24 settings
  const ENTITY_TYPE_ID = 1; // 1 = Lead

  console.log(`[attachFileToLead] 🚀 Starting upload for Lead ID: ${leadId}`);

  try {
    // 1. Fetch existing files
    console.log(
      `[attachFileToLead] 🔍 Fetching existing files from field: ${FILE_FIELD}`,
    );
    const data = await callBX24Method("crm.item.get", {
      entityTypeId: ENTITY_TYPE_ID,
      id: leadId,
      select: [FILE_FIELD],
    });

    const item = data?.item;
    if (!item) {
      throw new Error(`Lead with ID ${leadId} not found or access denied.`);
    }

    // Map existing files to the required format: [{id: 123}, {id: 124}]
    const existingFiles = Array.isArray(item[FILE_FIELD])
      ? item[FILE_FIELD].map((f) => ({ id: f.id }))
      : [];

    console.log(
      `[attachFileToLead] 📂 Found ${existingFiles.length} existing files.`,
    );

    // 2. Prepare the new file
    console.log(
      `[attachFileToLead] ⚙️ Converting file "${file.name || "document.pdf"}" to Base64...`,
    );
    const base64Content = await blobToBase64(file);

    const fileName = file.name || `Attachment_${Date.now()}.pdf`;
    const newFilePayload = [fileName, base64Content];

    // 3. Merge and Update
    const finalPayload = [...existingFiles, newFilePayload];
    console.log(
      `[attachFileToLead] 📤 Sending update request with total ${finalPayload.length} files...`,
    );

    const updateResult = await callBX24Method("crm.item.update", {
      entityTypeId: ENTITY_TYPE_ID,
      id: leadId,
      fields: {
        [FILE_FIELD]: finalPayload,
      },
    });

    console.log(`[attachFileToLead] ✅ Success! Lead updated.`, updateResult);
    return updateResult;
  } catch (error) {
    console.error(`[attachFileToLead] ❌ FATAL ERROR:`, error);
    // If it's the specific "not a blob" error, give a hint
    if (error.message.includes("FileReader")) {
      console.warn(
        "Hint: Make sure you are passing doc.output('blob') from jsPDF, not the jsPDF object itself.",
      );
    }
    throw error;
  }
};
