using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AliveControl
{
    public class PCIDevice
    {
        public String Name, Type;

        public JObject GetACObj()
        {
            JObject obj = new JObject();
            obj["name"] = Name;
            obj["type"] = Type;
            return obj;
        }
    }
}
