using Fireworks;
using ShapeLibrary;

namespace FireworksTests;

[TestClass]
public class FireworkTests
{
    class TestExplosionPattern : IExplosionPattern
    {
        public int NumberOfParticles { get; }
        public Vector ExplosionVelocity { get; }
        public Vector LaunchVelocity { get; }

        public TestExplosionPattern(
            int numberOfParticles = 5,
            Vector? explosionVelocity = null,
            Vector? launchVelocity = null)
        {
            NumberOfParticles = numberOfParticles;
            ExplosionVelocity = explosionVelocity ?? new Vector(1f, -1f);
            LaunchVelocity = launchVelocity ?? new Vector(0f, -12f);
        }
    }

    [TestMethod]
    [ExpectedException(typeof(ArgumentException))]
    public void FireworkShouldThrowWhenInvalidParameters()
    {
        new Firework(1f, -1f, new Colour(0, 0, 0), new TestExplosionPattern());

        Assert.IsTrue(false);
    }

    [TestMethod]
    [ExpectedException(typeof(ArgumentNullException))]
    public void FireworkShouldThrowWhenNullPattern()
    {
        new Firework(1f, 1f, new Colour(0, 0, 0), null);

        Assert.IsTrue(false);
    }

    [TestMethod]
    public void FireworkLaunchDoesNotThrowAndCanUpdate()
    {
        float w = 100f;
        float h = 200f;
        float x = 20f;
        float y = 190f;
        var color = new Colour(0, 0, 0);
        int lifespan = 2;
        var pattern = new TestExplosionPattern(numberOfParticles: 3);

        var fw = new Firework(w, h, x, y, color, lifespan, pattern);

        fw.Launch();

        for (int i = 0; i < 5; i++)
        {
            fw.Update();
        }

        Assert.IsTrue(fw.Exploded);
        Assert.AreEqual(3, fw.Particles.Count);
    }

    [TestMethod]
    public void FireworkExplosionParticlesAreRemovedWhenDone()
    {
        float w = 100f;
        float h = 200f;
        float x = 20f;
        float y = 190f;

        var color = new Colour(0, 0, 0);
        int lifespan = 0;
        var pattern = new TestExplosionPattern(numberOfParticles: 4);

        var fw = new Firework(w, h, x, y, color, lifespan, pattern);

        fw.Update();
        Assert.IsTrue(fw.Exploded);
        Assert.AreEqual(4, fw.Particles.Count);

        for (int i = 0; i < 45; i++)
        {
            fw.Update();
        }

        Assert.AreEqual(0, fw.Particles.Count);
    }
}
