using ShapeLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fireworks
{
    public static class ParticleFactory
    {
        public static IParticle CreateParticle(float x, float y, Colour color, int lifespan)
        {
            return new Particle(x, y, color, lifespan);
        }
    }
}
