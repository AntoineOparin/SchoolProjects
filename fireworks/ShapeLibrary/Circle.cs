using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShapeLibrary
{
    internal class Circle : ICircle
    {
        private readonly int _numberOfPoints = 70;
        public float Radius { get; }
        public Colour Colour { get; }
        private List<Vector> _vertices;
        public List<Vector> Vertices
        {
            get
            {
                if (_vertices == null)
                {
                    List<Vector> newVertices = [];
                    for (int i = 0; i < _numberOfPoints; i++)
                    {
                        float x = (float)(Center.X + Radius * Math.Cos(i * ((2 * Math.PI) / _numberOfPoints)));
                        float y = (float)(Center.Y + Radius * Math.Sin(i * ((2 * Math.PI) / _numberOfPoints)));
                        newVertices.Add(new Vector(x, y));
                    }
                    _vertices = newVertices;
                }
                return _vertices;
            }
        }
        public Circle(float x, float y, float radius, Colour color) 
        { 
            if (radius <= 0) throw new ArgumentException("Radius must be bigger than 0");

            Center = new Vector(x, y);
            Radius = radius;
            Colour = color;
        }
        public Vector Center { get; }
    }
}
