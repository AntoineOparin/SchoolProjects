using DrawingLibrary.Graphics;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Input;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DrawingLibrary.Input
{
    public sealed class CustomMouse : ICustomMouse
    {
        private static CustomMouse _instance = null;
        private MouseState _previous = Mouse.GetState();
        private MouseState _current = Mouse.GetState();

        private CustomMouse() { }

        public static CustomMouse Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new CustomMouse();
                }
                return _instance;
            }
        }

        public Point WindowPosition => new(_previous.X, _previous.Y);

        public Vector2? GetScreenPosition(IScreen screen)
        {
            if (screen == null)
            {
                throw new NotImplementedException("Missing screen parameter");
            }

            Rectangle screenRectangle = screen.CalculateDestinationRectangle();

            int x = WindowPosition.X - screenRectangle.X;
            int y = WindowPosition.Y - screenRectangle.Y;

            if (x > screenRectangle.Width || y > screenRectangle.Height || x < 0 || y < 0)
            {
                return null;
            }
            return new Vector2((x * screen.Width) / screenRectangle.Width, (y * screen.Height) / screenRectangle.Height);
        }

        public bool IsLeftButtonClicked()
        {
            return _previous.LeftButton == ButtonState.Pressed && _current.LeftButton == ButtonState.Released;
        }

        public bool IsLeftButtonDown()
        {
            return _previous.LeftButton == ButtonState.Pressed && _current.LeftButton == ButtonState.Pressed;
        }

        public bool IsLeftButtonUp()
        {
            return _previous.LeftButton == ButtonState.Released && _current.LeftButton == ButtonState.Released;
        }

        public bool IsMiddleButtonClicked()
        {
            return _previous.MiddleButton == ButtonState.Pressed && _current.MiddleButton == ButtonState.Released;
        }

        public bool IsMiddleButtonDown()
        {
            return _previous.MiddleButton == ButtonState.Pressed && _current.MiddleButton == ButtonState.Pressed;
        }

        public bool IsRightButtonClicked()
        {
            return _previous.RightButton == ButtonState.Pressed && _current.RightButton == ButtonState.Released;
        }

        public bool IsRightButtonDown()
        {
            return _previous.RightButton == ButtonState.Pressed && _current.RightButton == ButtonState.Pressed;
        }

        public void Update()
        {
            _previous = _current;
            _current = Mouse.GetState();
        }
    }
}
