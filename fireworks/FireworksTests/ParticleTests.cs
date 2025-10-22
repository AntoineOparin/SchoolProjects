using ShapeLibrary;

namespace Fireworks.Tests
{
    [TestClass]
    public class ParticleTests
    {
        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        public void CtorThrowsWhenXIsNegativeTest()
        {
            var p = new Particle(-1f, 0f, new Colour(255, 255, 255), lifespan: 10);
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        public void CtorThrowsWhenYIsNegativeTest()
        {
            var p = new Particle(0f, -5f, new Colour(255, 255, 255), lifespan: 10);
        }

        [TestMethod]
        public void ParticleConstructorTest()
        {
            float x = 100f;
            float y = 200f;
            int lifespan = 5;
            var colour = new Colour(10, 20, 30);

            IParticle p = ParticleFactory.CreateParticle(x, y, colour, lifespan);

            Assert.AreEqual(x, p.Position.X, 1e-3f);
            Assert.AreEqual(y, p.Position.Y, 1e-3f);

            Assert.AreEqual(0f, p.Velocity.X, 1e-3f);
            Assert.AreEqual(0f, p.Velocity.Y, 1e-3f);

            Assert.AreEqual(0f, p.Acceleration.X, 1e-3f);
            Assert.AreEqual(0f, p.Acceleration.Y, 1e-3f);

            Assert.AreEqual(colour, p.Colour);

            Assert.AreEqual(x, p.Circle.Center.X, 1e-3f);
            Assert.AreEqual(y, p.Circle.Center.Y, 1e-3f);

            Assert.IsFalse(p.Done);
        }

        [TestMethod]
        public void ApplyGravitySetsConstantDownwardAccelerationTest()
        {
            IParticle p = ParticleFactory.CreateParticle(0f, 0f, new Colour(255, 255, 255), 5);

            Assert.AreEqual(0f, p.Acceleration.X, 1e-3f);
            Assert.AreEqual(0f, p.Acceleration.Y, 1e-3f);

            p.ApplyGravity();

            Assert.AreEqual(0f, p.Acceleration.X, 1e-3f);
            Assert.AreEqual(0.2f, p.Acceleration.Y, 1e-3f);
        }

        [TestMethod]
        public void ApplyVelocityAddsToCurrentVelocityTest()
        {
            IParticle p = ParticleFactory.CreateParticle(0f, 0f, new Colour(255, 255, 255), 5);

            p.ApplyVelocity(new Vector(3f, -4f));
            Assert.AreEqual(3f, p.Velocity.X, 1e-3f);
            Assert.AreEqual(-4f, p.Velocity.Y, 1e-3f);

            p.ApplyVelocity(new Vector(1f, 2f));
            Assert.AreEqual(4f, p.Velocity.X, 1e-3f);
            Assert.AreEqual(-2f, p.Velocity.Y, 1e-3f);
        }

        [TestMethod]
        public void DoneTrueWhenLifespanIsZeroTest()
        {
            IParticle p = ParticleFactory.CreateParticle(0f, 0f, new Colour(255, 255, 255), 1);

            Assert.IsFalse(p.Done);
            p.Update();
            Assert.IsTrue(p.Done);
        }
    }
}