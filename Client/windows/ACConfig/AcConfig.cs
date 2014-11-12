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
using System.Threading.Tasks;

namespace ACConfig
{
    public partial class AcConfig : Form
    {
        String path;
        String username, password;
        BackgroundWorker worker;

        public AcConfig()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (sessionKey.Text.Length == 0)
            {
                MessageBox.Show("Sua chave de sessão está em branco!");
                return;
            }
            RegMan.Write("SessionKey", sessionKey.Text);
            RegMan.Write("Name", name.Text);
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
            name.Text = tvstools.GetMachineName();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            ServiceInstaller.Uninstall("AliveControl");
        }

        private void button3_Click(object sender, EventArgs e)
        {
            progressBar1.Visible = true;
            username = loginUsername.Text;
            password = loginPassword.Text;
            loginPassword.Enabled = false;
            loginUsername.Enabled = false;
            button3.Enabled = false;
            worker = new BackgroundWorker();
            worker.WorkerReportsProgress = false;
            worker.WorkerSupportsCancellation = true;
            worker.DoWork += new DoWorkEventHandler(DoLogin);
            worker.RunWorkerAsync();
        }
        public delegate void AfterLoginDelegate(bool ok);

        private void AfterLogin(bool ok)
        {
            if (progressBar1.InvokeRequired)
            {
                progressBar1.Invoke(new AfterLoginDelegate(AfterLogin), new object[] { ok });
            }
            else
            {
                progressBar1.Visible = false;
                loginPassword.Enabled = true;
                loginUsername.Enabled = true;
                button3.Enabled = true;
                if (ok)
                {
                    sessionKey.Text = AliveControl.API.SessionKey;
                    MessageBox.Show("Login OK");
                }
                else
                {
                    MessageBox.Show("Erro no login!");
                }
            }
        }
        private void DoLogin(object sender, DoWorkEventArgs e)
        {
            bool ok = AliveControl.API.Login(username, password, -1);
            AfterLogin(ok);
        }
    }
}
