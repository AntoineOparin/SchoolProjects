using Microsoft.Xna.Framework.Input;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DrawingLibrary.Input
{
    public sealed class CustomKeyboard : ICustomKeyboard
    {
        private static CustomKeyboard _instance = null;
        private KeyboardState _previous = Keyboard.GetState();
        private KeyboardState _current = Keyboard.GetState();

        private CustomKeyboard() { }

        public static CustomKeyboard Instance
        {
            get 
            {
                if (_instance == null)
                {
                    _instance = new CustomKeyboard();
                }
                return _instance;
            }
        }

        public bool IsKeyClicked(Keys key)
        {
            return _previous.IsKeyDown(key) && Keyboard.GetState().IsKeyUp(key);
        }

        public bool IsKeyDown(Keys key)
        {
            return _previous.IsKeyDown(key);
        }

        public void Update()
        {
            _previous = _current;
            _current = Keyboard.GetState();
        }
    }
}
