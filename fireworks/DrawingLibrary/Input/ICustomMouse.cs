
using DrawingLibrary.Graphics;
using Microsoft.Xna.Framework;

namespace DrawingLibrary.Input
{
    public interface ICustomMouse
    {
        /// <summary>
        /// Current mouse position with respect to the window
        /// </summary>
        Point WindowPosition { get; }

        /// <summary>
        /// Converts the current mouse position to its relative position in the provided screen.
        /// Note, if the position is outside the area of the screen, the method returns null
        /// </summary>
        /// <param name="screen">The screen whose coordinate system the point must be converted to.</param>
        /// <returns>The converted point with respect to the screens coordinate system</returns>
        Vector2? GetScreenPosition(IScreen screen);
        
        
        bool IsLeftButtonClicked();
        bool IsLeftButtonDown();
        bool IsLeftButtonUp();
        bool IsMiddleButtonClicked();
        bool IsMiddleButtonDown();
        bool IsRightButtonClicked();
        bool IsRightButtonDown();
        
        /// <summary>
        /// Updates the states of the mouse. Needs to be called in an update loop
        /// </summary>
        void Update();
    }
}