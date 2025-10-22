using ShapeLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fireworks
{
    internal class ExplosionPattern : IExplosionPattern
    {
        private Random _rng = new Random();
        public int NumberOfParticles => _rng.Next(60, 101);

        public Vector ExplosionVelocity => new Vector((float)(_rng.NextDouble() * (4 - (-4)) + (-4)), (float)(_rng.NextDouble() * (4 - (-4)) + (-4)));

        public Vector LaunchVelocity => new Vector(0, -(float)(_rng.Next(11, 16)));
    }
}
