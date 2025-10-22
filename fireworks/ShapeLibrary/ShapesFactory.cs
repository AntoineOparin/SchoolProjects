using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShapeLibrary
{
    public static class ShapesFactory
    {
        public static ICircle CreateCircle(float x, float y, float radius, Colour color)
        {
            return new Circle(x, y, radius, color);
        }

        public static IRectangle CreateRectangle(float x, float y, float width, float height, Colour color)
        {
            return new Rectangle(x, y, width, height, color);
        }
    }
}
