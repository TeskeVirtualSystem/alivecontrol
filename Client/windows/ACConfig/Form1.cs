using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using AliveControl;
using SvcInstaller;

namespace ACConfig
{
    public partial class Form1 : Form
    {
        String path;

        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            RegMan.Write("SessionKey", textBox1.Text);
            String ServicePath = path + "\\AliveControlService.exe";
            try
            {
                ServiceInstaller.InstallAndStart("TVS AliveControl4", "TVS AliveControl4", ServicePath);
                MessageBox.Show("Serviço Instalado!");
            }
            catch (Exception)
            {
                MessageBox.Show("Erro ao instalar serviço!");
            }
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            RegMan.SetProgramBase("AliveControl");
            path = RegMan.Read("path");
            textBox2.Text = path;
        }

        private void button2_Click(object sender, EventArgs e)
        {
            ServiceInstaller.Uninstall("AliveControl");
        }
    }
}
