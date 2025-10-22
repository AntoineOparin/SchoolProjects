using ShapeLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fireworks
{
    public static class FireworkFactory
    {
        public static IFirework CreateFirework(float width, float height, Colour color, IExplosionPattern pattern)
        {
            return new Firework(width, height, color, pattern);
        }

        public static IFirework CreateFirework(float width, float height, float x, float y, Colour color, int lifespan, IExplosionPattern pattern)
        {
            return new Firework(width, height, x, y, color, lifespan, pattern);
        }
    }
}
