using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShapeLibrary
{
    public interface IRectangle : IShape
    {
        /// <summary>
        /// The x coord of the upper left corner of the rectangle
        /// </summary>
        public float X { get; }
        /// <summary>
        /// The y coord of the upper left corner of the rectangle
        /// </summary>
        public float Y { get; }
        /// <summary>
        /// The width of the rectangle
        /// </summary>
        public float Width { get; }
        /// <summary>
        /// The height of the rectangle
        /// </summary>
        public float Height { get; }
    }
}
