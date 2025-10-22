
using Microsoft.Xna.Framework.Input;

namespace DrawingLibrary.Input
{
    public interface ICustomKeyboard
    {
        /// <summary>
        /// Indicates if the key has been pressed.
        /// </summary>
        /// <param name="key">The key to check</param>
        /// <returns>If the key was clicked</returns>
        bool IsKeyClicked(Keys key);

        /// <summary>
        /// Indicates if the key is down
        /// </summary>
        /// <param name="key">The key to check</param>
        /// <returns>If the key is down</returns>
        bool IsKeyDown(Keys key);
        /// <summary>
        /// Updates the status of the keyboard. Needs to be called in the update loop
        /// </summary>
        void Update();
    }
}