using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShapeLibrary
{
    internal class Rectangle : IRectangle
    {
        public float X { get; }

        public float Y { get; }

        public float Width { get; }

        public float Height { get; }

        public Colour Colour { get; }

        private List<Vector> _vertices;

        public List<Vector> Vertices
        {
            get
            {
                if (_vertices == null)
                {
                    List<Vector> newVertices =
                    [
                        new Vector(X, Y),
                        new Vector(X + Width, Y),
                        new Vector(X + Width, Y + Height),
                        new Vector(X, Y + Height),
                    ];
                    _vertices = newVertices;
                }
                return _vertices;
            }
        }

        public Rectangle(float x, float y, float width, float height, Colour color)
        {
            if (width <= 0) throw new ArgumentException("Width must be positive");
            if (height <= 0) throw new ArgumentException("Height must be positive");

            X = x;
            Y = y;
            Width = width;
            Height = height;
            Colour = color;
        }
    }
}
