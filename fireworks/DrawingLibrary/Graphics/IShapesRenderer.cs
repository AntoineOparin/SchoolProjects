using Microsoft.Xna.Framework.Graphics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ShapeLibrary;

namespace DrawingLibrary.Graphics
{
    public interface IShapesRenderer : IDisposable
    {
        /// <summary>
        /// Start drawing the shapes
        /// </summary>
        void Begin();

        /// <summary>
        /// Draw a given shape
        /// </summary>
        /// <param name="shape"></param>
        void DrawShape(IShape shape, float thickness = 0.8f);

        /// <summary>
        /// Ends the drawing
        /// </summary>
        void End();
    }
}
