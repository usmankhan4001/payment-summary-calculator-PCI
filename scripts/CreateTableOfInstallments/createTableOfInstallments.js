export const createTableOfInstallments = () => {
  const plan = document.getElementById("payment-condition").value;

  if (plan == "full") {
    const tableBody = document.getElementById("installment-table-body");
    tableBody.innerHTML = "";
    return;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "decimal",

    currency: "USD",
  });

  const getInstallmentNumber = document.getElementById(
    "installment-duration",
  ).value;
  const installmentPerAmount =
    document
      .getElementById("summary-installment")
      .textContent.replace(/[^0-9.-]+/g, "") || 0;

  const tableBody = document.getElementById("installment-table-body");
  tableBody.innerHTML = "";

  for (let i = 1; i <= getInstallmentNumber; i++) {
    const row = document.createElement("tr");
    // Removed the white/10 background to ensure black text is readable on white
    row.classList.add("bg-white", "border-b", "border-gray-200");

    const installmentCell = document.createElement("td");
    // Changed text-gray-300 to text-gray-900 (Black)
    installmentCell.classList.add(
      "px-6",
      "py-4",
      "whitespace-nowrap",
      "text-sm",
      "text-gray-900",
      "font-medium",
    );
    installmentCell.textContent = `${i}`;

    const amountCell = document.createElement("td");
    // Changed text-gray-300 to text-gray-900 (Black)
    amountCell.classList.add(
      "px-6",
      "py-4",
      "whitespace-nowrap",
      "text-sm",
      "text-gray-900",
    );
    amountCell.textContent = `${formatter.format(installmentPerAmount)}`;

    row.appendChild(installmentCell);
    row.appendChild(amountCell);
    tableBody.appendChild(row);
  }
};
