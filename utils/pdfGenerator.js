const PDFDocument = require('pdfkit');

module.exports = function generatePDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(20).text('Driver Application', { align: 'center' });
      doc.moveDown();

      // Current Address
      doc.fontSize(14).text('Current Address');
      doc.fontSize(12).text(`Address: ${data?.currentAddress?.address || 'N/A'}`);
      doc.text(`City: ${data?.currentAddress?.city || 'N/A'}`);
      doc.text(`State: ${data?.currentAddress?.state || 'N/A'}`);
      doc.text(`ZIP: ${data?.currentAddress?.zip || 'N/A'}`);
      doc.moveDown();

      // Medical
      doc.fontSize(14).text('DOT Medical');
      doc.fontSize(12).text(`Currently certified: ${data?.medical?.isCurrent ? 'Yes' : 'No'}`);
      doc.moveDown();

      // Employment History
      doc.fontSize(14).text('Current Employer');
      const ce = data?.currentEmployer || {};
      doc.fontSize(12).text(`Employer: ${ce.employer || 'N/A'}`);
      doc.text(`From: ${ce.from || 'N/A'} To: ${ce.to || 'N/A'}`);
      doc.text(`Position: ${ce.position || 'N/A'}`);
      doc.text(`Phone: ${ce.phone || 'N/A'}`);
      doc.text(`Address: ${ce.address || 'N/A'}`);
      doc.text(`Reason for leaving: ${ce.reason || 'N/A'}`);
      doc.moveDown();

      // Driving Experience (only an overview)
      doc.fontSize(14).text('Driving Experience');
      const dx = data?.drivingExperience?.equipment || {};
      doc.fontSize(12).text(`Straight Truck: ${dx.straightTruckSelected ? 'Yes' : 'No'}, From: ${dx.straightTruckFrom}, To: ${dx.straightTruckTo}, Mileage: ${dx.straightTruckMileage}`);
      doc.text(`Tractor Semi: ${dx.tractorSemiSelected ? 'Yes' : 'No'}, From: ${dx.tractorSemiFrom}, To: ${dx.tractorSemiTo}, Mileage: ${dx.tractorSemiMileage}`);
      doc.moveDown();

      // Declaration
      doc.fontSize(14).text('Declaration');
      doc.fontSize(12).text(`Signature: ${data?.declaration?.signature || 'N/A'}`);
      doc.text(`Date: ${data?.declaration?.date || 'N/A'}`);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};