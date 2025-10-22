using Fireworks;
using ShapeLibrary;

namespace FireworksTests;

[TestClass]
public class FireworkEnvironmentTests
{
    [TestMethod]
    public void ListOfFireworksInitializedTest()
    {
        var fe = new FireworkEnvironment();

        Assert.IsNotNull(fe);
    }

    [TestMethod]
    public void ListOfFireworksClearedTest()
    {
        var fe = new FireworkEnvironment();

        for (int i = 0; i < 51; i++)
        {
            fe.AddFirework(new Firework(3f, 3f, new Colour(1, 1, 1), ExplosionPatternFactory.CreateExplosionPattern()));
        }

        Assert.AreEqual(fe.Fireworks.Count, 1);
    }
}
