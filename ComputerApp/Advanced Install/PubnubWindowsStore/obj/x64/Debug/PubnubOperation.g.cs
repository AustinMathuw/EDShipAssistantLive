﻿#pragma checksum "C:\Users\sirau\Source\Repos\Elite_Dangerous_Ship_Assistant\ComputerApp\PubnubWindowsStore\PubnubOperation.xaml" "{406ea660-64cf-4c82-b6f0-42d48172a799}" "4BAFD41D5F75BAC6458FE9B7DA0353BB"
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace PubnubWindowsStore
{
    partial class PubnubOperation : 
        global::Windows.UI.Xaml.Controls.Page, 
        global::Windows.UI.Xaml.Markup.IComponentConnector,
        global::Windows.UI.Xaml.Markup.IComponentConnector2
    {
        /// <summary>
        /// Connect()
        /// </summary>
        [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Microsoft.Windows.UI.Xaml.Build.Tasks"," 14.0.0.0")]
        [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
        public void Connect(int connectionId, object target)
        {
            switch(connectionId)
            {
            case 1:
                {
                    this.ContentRoot = (global::Windows.UI.Xaml.Controls.Grid)(target);
                }
                break;
            case 2:
                {
                    this.fotter = (global::Windows.UI.Xaml.Controls.Grid)(target);
                }
                break;
            case 3:
                {
                    global::Windows.UI.Xaml.Controls.Button element3 = (global::Windows.UI.Xaml.Controls.Button)(target);
                    #line 53 "..\..\..\PubnubOperation.xaml"
                    ((global::Windows.UI.Xaml.Controls.Button)element3).Click += this.btnBack_Click;
                    #line default
                }
                break;
            case 4:
                {
                    this.subscribeResult = (global::Windows.UI.Xaml.Controls.TextBox)(target);
                    #line 39 "..\..\..\PubnubOperation.xaml"
                    ((global::Windows.UI.Xaml.Controls.TextBox)this.subscribeResult).DoubleTapped += this.txtResult_DoubleTapped;
                    #line default
                }
                break;
            case 5:
                {
                    this.publishResult = (global::Windows.UI.Xaml.Controls.TextBox)(target);
                    #line 40 "..\..\..\PubnubOperation.xaml"
                    ((global::Windows.UI.Xaml.Controls.TextBox)this.publishResult).DoubleTapped += this.txtResult_DoubleTapped;
                    #line default
                }
                break;
            case 6:
                {
                    global::Windows.UI.Xaml.Controls.TextBlock element6 = (global::Windows.UI.Xaml.Controls.TextBlock)(target);
                    #line 42 "..\..\..\PubnubOperation.xaml"
                    ((global::Windows.UI.Xaml.Controls.TextBlock)element6).SelectionChanged += this.TextBlock_SelectionChanged;
                    #line default
                }
                break;
            default:
                break;
            }
            this._contentLoaded = true;
        }

        [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Microsoft.Windows.UI.Xaml.Build.Tasks"," 14.0.0.0")]
        [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
        public global::Windows.UI.Xaml.Markup.IComponentConnector GetBindingConnector(int connectionId, object target)
        {
            global::Windows.UI.Xaml.Markup.IComponentConnector returnValue = null;
            return returnValue;
        }
    }
}

