using Fireworks;

namespace FireworksTests;

[TestClass]
public class ExplosionPatternTests
{
    [TestMethod]
    public void ExplosionPatternNumberOfParticlesWithinRange()
    {
        var ep = new ExplosionPattern();

        for (int i = 0; i < 50; i++)
        {
            int n = ep.NumberOfParticles;
            Assert.IsTrue(n >= 60 && n <= 100);
        }
    }

    [TestMethod]
    public void ExplosionPatternExplosionVelocityComponentsWithinRange()
    {
        var ep = new ExplosionPattern();

        for (int i = 0; i < 50; i++)
        {
            var v = ep.ExplosionVelocity;
            Assert.IsTrue(v.X >= -4f && v.X <= 4f);
            Assert.IsTrue(v.Y >= -4f && v.Y <= 4f);
        }
    }

    [TestMethod]
    public void ExplosionPatternLaunchVelocityWithinRange()
    {
        var ep = new ExplosionPattern();

        for (int i = 0; i < 50; i++)
        {
            var v = ep.LaunchVelocity;
            Assert.AreEqual(0f, v.X, 0.0001);
            Assert.IsTrue(v.Y <= -11f && v.Y >= -15f);
        }
    }
}
