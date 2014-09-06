using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AliveControl
{
    public class VirtualMachine
    {
        public String OS, Name, Type, Status;
        public int RAM, CPUs;

        public JObject GetACObj()
        {
            JObject obj = new JObject();
            obj["name"] = Name;
            obj["guestos"] = OS;
            obj["memory"] = RAM;
            obj["cpus"] = CPUs;
            obj["type"] = Type;
            obj["status"] = Status;
            return obj;
        }
    }
}
