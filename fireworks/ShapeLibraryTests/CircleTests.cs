using ShapeLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShapeLibraryTests
{
    public class CircleTests
    {
        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        public void CircleInvalidConstructorTest()
        {
            Colour colour = new(0, 0, 0);

            var c1 = new Circle(10f, 20f, -20f, colour);

            Assert.IsTrue(false);
        }

        [TestMethod]
        public void CircleConstructorTest()
        {
            float x = 10f;
            float y = 20f;
            float r = 30f;
            Colour colour = new(0, 0, 0);

            var c1 = new Circle(x, y, r, colour);

            Assert.AreEqual(x, c1.Center.X);
            Assert.AreEqual(y, c1.Center.Y);
            Assert.AreEqual(r, c1.Radius);
            Assert.AreEqual(colour, c1.Colour);
        }

        [TestMethod]
        public void CircleCenterTest()
        {
            float x = 10f;
            float y = 20f;
            float r = 30f;
            Colour colour = new(0, 0, 0);

            var c1 = new Circle(x, y, r, colour);

            Assert.AreEqual(new Vector(x, y), c1.Center);
        }

        [TestMethod]
        public void Vertices_Computed_In_Expected_Order_And_Coordinates()
        {
            Colour colour = new(0, 0, 0);

            var c = new Circle(10f, 20f, 30f, colour);

            var vertices = c.Vertices;

            Assert.IsNotNull(vertices);
            Assert.AreEqual(8, vertices.Count, "Circle should have exactly 8 vertices.");

            // Test the first and last vertices
            Assert.AreEqual(30f, vertices[0].X);
            Assert.AreEqual(10f, vertices[0].Y);

            Assert.AreEqual(39.8792, vertices[69].X);
            Assert.AreEqual(7.3108, vertices[69].Y);
        }
    }
}
