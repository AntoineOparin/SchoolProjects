using ShapeLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fireworks
{
    internal class Firework : IFirework
    {
        private static Random _rng = new Random();
        public bool Exploded => Launcher.Done;
        private bool _particlesMade = false;

        public IParticle Launcher { get; private set; }

        public List<IParticle> Particles { get; private set; }

        public IExplosionPattern ExplosionPattern { get; private set; }

        public Firework(float width, float height, Colour color, IExplosionPattern pattern) 
        {
            if (width <= 0 || height <= 0)
            {
                throw new ArgumentException("Width or heigh cannot be 0 or less");
            }

            ArgumentNullException.ThrowIfNull(pattern);

            float x = (float)(_rng.NextDouble() * width);
            int lifespan = _rng.Next(30, 71);
            ExplosionPattern = pattern;
            Launcher = ParticleFactory.CreateParticle(x, height, color, lifespan);
            Particles = new List<IParticle>();
        }

        public Firework(float width, float height, float x, float y, Colour color, int lifespan, IExplosionPattern pattern)
        {
            if (width <= 0 || height <= 0)
            {
                throw new ArgumentException("Width or heigh cannot be 0 or less");
            }

            ArgumentNullException.ThrowIfNull(pattern);

            ExplosionPattern = pattern;
            Launcher = ParticleFactory.CreateParticle(x, y, color, lifespan);
            Particles = new List<IParticle>();
        }
        public void Launch()
        {
            Launcher.ApplyVelocity(ExplosionPattern.LaunchVelocity);
        }

        /// <summary>
        /// Updates the fireworks state. 
        /// Once the lifespan of the Launcher reaches zero, the firework explodes.
        /// When exploding the firework creates between 60-100 particles. 
        /// The exploded particles have a new velocity based on IExplosionPattern 
        /// and the velocity of the launcher. When the lifespan of the explosion particles
        /// reaches zero they are removed
        /// </summary>
        public void Update()
        {
            Launcher.ApplyGravity();
            Launcher.Update();

            if (Exploded)
            {
                if (!_particlesMade) {
                    for (int i = 0; i < ExplosionPattern.NumberOfParticles; i++)
                    {
                        IParticle particle = ParticleFactory.CreateParticle(Launcher.Position.X, Launcher.Position.Y, Launcher.Colour, 40);
                        particle.ApplyVelocity(ExplosionPattern.ExplosionVelocity);
                        particle.ApplyGravity();
                        Particles.Add(particle);
                    }
                    _particlesMade = true;
                }

                for (int i = 0; i < Particles.Count; i++)
                {
                    Particles[i].Update();
                    if (Particles[i].Done)
                    {
                        Particles.Remove(Particles[i]);
                    }
                }
            }
        }
    }
}
