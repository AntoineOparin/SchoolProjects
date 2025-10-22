namespace ShapeLibraryTests;
using ShapeLibrary;

[TestClass]
public sealed class ColourTests
{
    [TestMethod]
    [ExpectedException(typeof(ArgumentOutOfRangeException))]
    public void InvalidArgumentsColourConstructor()
    {
        var c = new Colour (3, 4, -5);

        Assert.IsTrue(false);
    }

    [TestMethod]
    public void ColourAddition()
    {
        var c1 = new Colour (1, 2, 3);
        var c2 = new Colour (2, 3, 4);

        var sum = c1 + c2;

        Assert.AreEqual(3, sum.Red);
        Assert.AreEqual(5, sum.Green);
        Assert.AreEqual(7, sum.Blue);
    }

    [TestMethod]
    public void ColourSubstraction()
    {
        var c1 = new Colour(2, 3, 4);
        var c2 = new Colour(1, 2, 3);

        var sub = c1 - c2;

        Assert.AreEqual(1, sub.Red);
        Assert.AreEqual(1, sub.Green);
        Assert.AreEqual(1, sub.Blue);
    }

    [TestMethod]
    public void ColourMultiplication()
    {
        var c1 = new Colour(1, 2, 3);

        var multiply = c1 * 4;

        Assert.AreEqual(4, multiply.Red);
        Assert.AreEqual(8, multiply.Green);
        Assert.AreEqual(12, multiply.Blue);
    }

    [TestMethod]
    public void ColourEqual()
    {
        var c1 = new Colour(2, 3, 4);
        var c2 = new Colour(2, 3, 4);

        var equal = c1 == c2;

        Assert.IsTrue(equal);
    }

    [TestMethod]
    public void ColourIsNotEqual()
    {
        var c1 = new Colour(2, 3, 4);
        var c2 = new Colour(1, 3, 4);

        var isNotEqual = c1 != c2;

        Assert.IsTrue(isNotEqual);
    }

    [TestMethod]
    public void ColourToString()
    {
        var c1 = new Colour(1, 2, 3);

        string str = c1.ToString();

        Assert.AreEqual(str, $"Red: {c1.Red}, Green: {c1.Green}, Blue: {c1.Blue}");
    }
}
