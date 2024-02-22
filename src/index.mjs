    import { jsPDF } from "jspdf";
    
    
    document.addEventListener("DOMContentLoaded", function () {
      const pdf = new jsPDF();
      const element = document.body;

      pdf.html(element, {
        callback: function (pdf) {
          pdf.save("output.pdf");
        }
      });
    });
