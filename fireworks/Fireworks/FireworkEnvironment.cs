using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fireworks
{
    public class FireworkEnvironment
    {
        public List<IFirework> Fireworks { get; }

        public FireworkEnvironment() 
        { 
            Fireworks = new List<IFirework>(); 
        }
        // Launches the firework and adds the firework to a list
        public void AddFirework(IFirework f)
        {
            Clear();
            Fireworks.Add(f);
            f.Launch();
        }

        // Updates the state of the fireworks
        public void Update()
        {
            foreach (var f in Fireworks)
            {
                f.Update();
            }
        }

        // Clears fireworks if the count exceeds 50 (prevents memory overload)
        public void Clear()
        {
            if (Fireworks.Count >= 50)
            {
                Fireworks.Clear();
            }
        }
    }
}
