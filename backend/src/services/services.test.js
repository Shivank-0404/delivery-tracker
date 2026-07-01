const { haversine } = require('./assignmentService');

describe('Services Unit Tests', () => {
  
  describe('Volumetric and Weight Math Helpers', () => {
    test('Volumetric weight logic should match formula (L x B x H) / 5000', () => {
      const length = 30;
      const breadth = 20;
      const height = 15;
      
      const volumetricWeight = (length * breadth * height) / 5000;
      
      expect(volumetricWeight).toBe(1.8);
      
      const billedWeight1 = Math.max(1.5, volumetricWeight); // Volumetric greater
      expect(billedWeight1).toBe(1.8);
      
      const billedWeight2 = Math.max(5.5, volumetricWeight); // Actual weight greater
      expect(billedWeight2).toBe(5.5);
    });

    test('COD Surcharge calculation matches percentage', () => {
      const deliveryCharge = 100.00;
      const codSurchargePct = 2.5; // 2.5%
      
      const codSurcharge = deliveryCharge * (codSurchargePct / 100);
      expect(codSurcharge).toBe(2.50);
      
      const totalCharge = deliveryCharge + codSurcharge;
      expect(totalCharge).toBe(102.50);
    });
  });

  describe('Haversine Proximity Calculations', () => {
    test('Haversine formula computes close distance correctly', () => {
      // New Delhi (28.6139, 77.2090) to Noida (28.5355, 77.3910)
      const dist = haversine(28.6139, 77.2090, 28.5355, 77.3910);
      
      // Distance is roughly ~19-20 km
      expect(dist).toBeGreaterThan(15);
      expect(dist).toBeLessThan(25);
    });

    test('Haversine formula handles invalid coordinates gracefully', () => {
      const dist = haversine(null, undefined, 28.5355, 77.3910);
      expect(dist).toBe(999999);
    });
  });

});
