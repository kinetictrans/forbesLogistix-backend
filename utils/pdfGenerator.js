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

      doc.fontSize(20).text('Driver Application', { align: 'center' }).moveDown();

      // --- Current Address ---
      const ca = data?.currentAddress || {};
      doc.fontSize(14).text('Current Address');
      doc.fontSize(12)
        .text(`Address: ${ca.address || 'N/A'}`)
        .text(`City: ${ca.city || 'N/A'}`)
        .text(`State: ${ca.state || 'N/A'}`)
        .text(`ZIP: ${ca.zip || 'N/A'}`).moveDown();

      // --- Previous Addresses ---
      doc.fontSize(14).text('Previous Addresses');
      (data.previousAddresses || []).forEach((addr, i) => {
        doc.fontSize(12).text(`Address ${i + 1}: ${addr.address || 'N/A'}, ${addr.city || 'N/A'}, ${addr.state || 'N/A'}, ${addr.zip || 'N/A'}`);
      });
      doc.moveDown();

      // --- Medical ---
      const med = data?.medical || {};
      doc.fontSize(14).text('DOT Medical');
      doc.fontSize(12).text(`Currently Certified: ${med.isCurrent ? 'Yes' : 'No'}`).moveDown();

      // --- Current Employer ---
      const ce = data?.currentEmployer || {};
      doc.fontSize(14).text('Current Employer');
      doc.fontSize(12)
        .text(`Employer: ${ce.employer || 'N/A'}`)
        .text(`From: ${ce.from || 'N/A'} To: ${ce.to || 'N/A'}`)
        .text(`Position: ${ce.position || 'N/A'}`)
        .text(`Phone: ${ce.phone || 'N/A'}`)
        .text(`Address: ${ce.address || 'N/A'}`)
        .text(`Reason for Leaving: ${ce.reason || 'N/A'}`)
        .text(`FMCSR: ${ce.fmcsr || 'N/A'}`)
        .text(`DOT Drug Test: ${ce.dotDrugTest || 'N/A'}`).moveDown();

      // --- Previous Employers ---
      doc.fontSize(14).text('Previous Employers');
      (data.previousEmployers || []).forEach((pe, i) => {
        doc.fontSize(12)
          .text(`Employer ${i + 1}: ${pe.employer || 'N/A'}`)
          .text(`From: ${pe.from || 'N/A'} To: ${pe.to || 'N/A'}`)
          .text(`Position: ${pe.position || 'N/A'}`)
          .text(`Phone: ${pe.phone || 'N/A'}`)
          .text(`Address: ${pe.address || 'N/A'}`)
          .text(`Reason: ${pe.reason || 'N/A'}`)
          .moveDown();
      });

      // --- Driving Experience ---
      const dx = data?.drivingExperience?.equipment || {};
      doc.fontSize(14).text('Driving Experience');
      doc.fontSize(12)
        .text(`Straight Truck: ${dx.straightTruckSelected ? 'Yes' : 'No'} | From: ${dx.straightTruckFrom || 'N/A'} | To: ${dx.straightTruckTo || 'N/A'} | Mileage: ${dx.straightTruckMileage || 'N/A'}`)
        .text(`Tractor Semi: ${dx.tractorSemiSelected ? 'Yes' : 'No'} | From: ${dx.tractorSemiFrom || 'N/A'} | To: ${dx.tractorSemiTo || 'N/A'} | Mileage: ${dx.tractorSemiMileage || 'N/A'}`)
        .text(`Tractor Two Trailers: ${dx.tractorTwoSelected ? 'Yes' : 'No'} | From: ${dx.tractorTwoFrom || 'N/A'} | To: ${dx.tractorTwoTo || 'N/A'} | Mileage: ${dx.tractorTwoMileage || 'N/A'}`)
        .text(`Tractor Triple Trailers: ${dx.tractorTripleSelected ? 'Yes' : 'No'} | From: ${dx.tractorTripleFrom || 'N/A'} | To: ${dx.tractorTripleTo || 'N/A'} | Mileage: ${dx.tractorTripleMileage || 'N/A'}`)
        .moveDown();

      doc.fontSize(14).text('States Operated In');
      doc.fontSize(12).text(`${data?.drivingExperience?.statesOperated || 'N/A'}`).moveDown();

      doc.fontSize(14).text('Courses');
      (data?.drivingExperience?.courses || []).forEach((c, i) => {
        doc.fontSize(12).text(`Course ${i + 1}: ${c}`);
      });
      doc.moveDown();

      doc.fontSize(14).text('Awards');
      (data?.drivingExperience?.awards || []).forEach((a, i) => {
        doc.fontSize(12).text(`Award ${i + 1}: ${a}`);
      });
      doc.moveDown();

      // --- Accident Records ---
      doc.fontSize(14).text('Accident Records');
      (data?.accidentRecords || []).forEach((a, i) => {
        doc.fontSize(12).text(`Accident ${i + 1}: ${JSON.stringify(a)}`);
      });
      doc.moveDown();

      // --- Traffic Convictions ---
      doc.fontSize(14).text('Traffic Convictions');
      (data?.trafficConvictions || []).forEach((tc, i) => {
        doc.fontSize(12).text(`Conviction ${i + 1}: ${JSON.stringify(tc)}`);
      });
      doc.moveDown();

      // --- Disclosures ---
      doc.fontSize(14).text('Disclosures');
      (data?.disclosures || []).forEach((d, i) => {
        doc.fontSize(12).text(`Disclosure ${i + 1}: ${JSON.stringify(d)}`);
      });
      doc.moveDown();

      // --- License History ---
      doc.fontSize(14).text('License History');
      (data?.licenseHistory || []).forEach((l, i) => {
        doc.fontSize(12).text(`License ${i + 1}: ${JSON.stringify(l)}`);
      });
      doc.moveDown();

      // --- References ---
      doc.fontSize(14).text('References');
      (data?.references || []).forEach((r, i) => {
        doc.fontSize(12).text(`Reference ${i + 1}: ${JSON.stringify(r)}`);
      });
      doc.moveDown();

      // --- Declaration ---
      const dec = data?.declaration || {};
      doc.fontSize(14).text('Declaration');
      doc.fontSize(12)
        .text(`Signature: ${dec.signature || 'N/A'}`)
        .text(`Date: ${dec.date || 'N/A'}`);

      doc.end();
    } catch (err) {
      console.error('Error generating PDF:', err);
      reject(err);
    }
  });
};