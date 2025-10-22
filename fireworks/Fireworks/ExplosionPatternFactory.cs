using ShapeLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fireworks
{
    public static class ExplosionPatternFactory
    {
        public static IExplosionPattern CreateExplosionPattern()
        {
            return new ExplosionPattern();
        }
    }
}
