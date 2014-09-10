using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceProcess;
using System.Text;

namespace AliveControlService
{
    static class Program
    {
        /// <summary>
        /// Base service: Just get Machine info and send.
        /// </summary>
        static void Main()
        {
            ServiceBase[] ServicesToRun;
            ServicesToRun = new ServiceBase[] 
            { 
                new AliveControlService() 
            };
            ServiceBase.Run(ServicesToRun);
        }
    }
}
