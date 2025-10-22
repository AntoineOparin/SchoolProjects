using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ShapeLibrary;

namespace ShapeLibraryTests
{
    [TestClass]
    public class RectangleTests
    {
        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        public void RectangleInvalidConstructorTest()
        {
            Colour colour = new(0,0,0);

            var r1 = new ShapeLibrary.Rectangle(10f, 20f, -20f, 90f, colour);

            Assert.IsTrue(false);
        }

        [TestMethod]
        public void RectangleConstructorTest()
        {
            float x = 10f;
            float y = 20f;
            float w = 30f;
            float h = 40f;
            Colour colour = new(0, 0, 0);

            var r1 = new ShapeLibrary.Rectangle(x, y, w, h, colour);

            Assert.AreEqual(x, r1.X);
            Assert.AreEqual(y, r1.Y);
            Assert.AreEqual(w, r1.Width);
            Assert.AreEqual(h, r1.Height);
            Assert.AreEqual(colour, r1.Colour);
        }

        [TestMethod]
        public void Vertices_Computed_In_Expected_Order_And_Coordinates()
        {
            Colour colour = new(0, 0, 0);

            var r = new ShapeLibrary.Rectangle(10f, 20f, 30f, 40f, colour);

            var vertices = r.Vertices;

            Assert.IsNotNull(vertices);
            Assert.AreEqual(4, vertices.Count, "Rectangle should have exactly 4 vertices.");

            // Expected order based on implementation:
            // (X, Y)
            // (X + Width, Y)
            // (X + Width, Y + Height)
            // (X, Y + Height)
            Assert.AreEqual(10f, vertices[0].X);
            Assert.AreEqual(20f, vertices[0].Y);

            Assert.AreEqual(40f, vertices[1].X);
            Assert.AreEqual(20f, vertices[1].Y);

            Assert.AreEqual(40f, vertices[2].X);
            Assert.AreEqual(60f, vertices[2].Y);

            Assert.AreEqual(10f, vertices[3].X);
            Assert.AreEqual(60f, vertices[3].Y);
        }
    }
}
