namespace ShapeLibraryTests;
using ShapeLibrary;

[TestClass]
public class VectorTest
{
    [TestMethod]
    public void VectorConstructor()
    {
        var v = new Vector(3f, 8f);

        Assert.AreEqual(3f, v.X);
        Assert.AreEqual(8f, v.Y);
    }

    [TestMethod]
    public void VectorAddition()
    {
        var v1 = new Vector(3f, 8f);
        var v2 = new Vector(3f, 8f);

        var sum = v1 + v2;

        Assert.AreEqual(6f, sum.X);
        Assert.AreEqual(16f, sum.Y);
    }

    [TestMethod]
    public void VectorSubstraction()
    {
        var v1 = new Vector(30f, 10f);
        var v2 = new Vector(3f, 8f);

        var sub = v1 - v2;

        Assert.AreEqual(27f, sub.X);
        Assert.AreEqual(2f, sub.Y);
    }

    [TestMethod]
    public void VectorMultiplication()
    {
        var v1 = new Vector(3f, 8f);

        var multiply = v1 * 9;

        Assert.AreEqual(27f, multiply.X);
        Assert.AreEqual(72f, multiply.Y);
    }

    [TestMethod]
    public void VectorDivision()
    {
        var v1 = new Vector(27f, 72f);

        var divide = v1 / 9;

        Assert.AreEqual(3f, divide.X);
        Assert.AreEqual(8f, divide.Y);
    }

    [TestMethod]
    [ExpectedException(typeof(ArgumentException))]
    public void VectorDivisionException()
    {
        var v1 = new Vector(27f, 72f);

        var divide = v1 / 0;

        Assert.IsTrue(false);
    }

    [TestMethod]
    public void VectorMagnitude()
    {
        var v1 = new Vector(2f, 3f);
        double answer = Math.Sqrt(13);

        var m = Vector.Magnitude(v1);

        Assert.AreEqual(answer, m);
    }

    [TestMethod]
    public void VectorMagnitudeNegative()
    {
        var v1 = new Vector(-2f, -3f);
        double answer = Math.Sqrt(13);

        var m = Vector.Magnitude(v1);

        Assert.AreEqual(answer, m);
    }

    [TestMethod]
    public void VectorNormalize()
    {
        var v1 = new Vector(2f, 3f);

        var n = Vector.Normalize(v1);

        Assert.AreEqual((int)Vector.Magnitude(n), 1);
    }

    [TestMethod]
    public void VectorToString()
    {
        var v1 = new Vector(2f, 3f);

        string str = v1.ToString();

        Assert.AreEqual(str, $"X: {v1.X}, Y: {v1.Y}");
    }
}
