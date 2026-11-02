/**
 * WhatsApp Business API Service
 * Handles transactional alerts for inventory, approvals, and enterprise notifications.
 */

export interface WhatsAppMessage {
  to: string; // Phone number with country code
  templateName: string;
  languageCode?: string;
  parameters: Record<string, string>;
}

class WhatsAppService {
  private apiUrl = '/api/whatsapp/send'; // Proxied via server.ts

  /**
   * Sends a transactional alert via WhatsApp
   * @param message WhatsApp message configuration
   */
  async sendAlert(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log(`[WhatsAppService] Sending alert to ${message.to} using template ${message.templateName}`, message.parameters);
      
      // In a real implementation, this would call the 360dialog, Twilio, or Meta WhatsApp Business API
      // For this applet, we simulate the API call with a fetch to our proxy
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('whatsapp_token') || 'demo_token'}`
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[WhatsAppService] Failed to send WhatsApp alert:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Pre-defined templates for ERP transactional alerts
   */
  async sendInventoryAlert(to: string, itemName: string, currentStock: number, minStock: number) {
    return this.sendAlert({
      to,
      templateName: 'inventory_low_stock_alert',
      parameters: {
        item_name: itemName,
        current_stock: currentStock.toString(),
        min_stock: minStock.toString(),
        cta_url: `${window.location.origin}/?module=inventory`
      }
    });
  }

  async sendInvoiceApprovalAlert(to: string, invoiceNo: string, amount: string, vendor: string) {
    return this.sendAlert({
      to,
      templateName: 'invoice_approval_request',
      parameters: {
        invoice_no: invoiceNo,
        amount,
        vendor,
        cta_url: `${window.location.origin}/?module=approvals`
      }
    });
  }

  async sendPaymentReceiptAlert(to: string, amount: string, receiptNo: string) {
    return this.sendAlert({
      to,
      templateName: 'payment_receipt_confirmation',
      parameters: {
        amount,
        receipt_no: receiptNo,
        date: new Date().toLocaleDateString('en-PK')
      }
    });
  }
}

export const whatsappService = new WhatsAppService();
