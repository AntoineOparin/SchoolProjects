using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShapeLibrary
{
    /// <summary>
    /// Represents any geometric shape
    /// </summary>
    public  interface IShape
    { 
        /// <summary>
        /// The vertices that make up the shape.
        /// The list of vertices is created automatically when the property is accessed and cached
        /// </summary>
        List<Vector> Vertices { get; }

        /// <summary>
        /// The color of the shape
        /// </summary>
        Colour Colour { get; }
    }
}
