const API = (window.location.hostname === 'localhost') ? 'http://localhost:5000' : '';

document.getElementById('year').innerText = new Date().getFullYear();

document.getElementById('volunteerForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = {
    name: v_name.value, email: v_email.value, phone: v_phone.value, area: v_area.value, message: v_msg.value
  };
  const res = await fetch(API + '/api/volunteer', {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
  });
  const out = await res.json();
  alert(out.msg || 'Submitted');
  document.getElementById('volunteerForm').reset();
});

document.getElementById('contactForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = { name: c_name.value, email: c_email.value, message: c_msg.value };
  const res = await fetch(API + '/api/contact', {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
  });
  const out = await res.json();
  alert(out.msg || 'Sent');
  document.getElementById('contactForm').reset();
});

document.getElementById('genQR').addEventListener('click', async ()=>{
  const amount = Number(document.getElementById('donationAmount').value);
  if(!amount || amount <= 0){ alert('Enter valid amount'); return; }
  const res = await fetch(API + '/api/donate/create-order', {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({amount})
  });
  const order = await res.json();
  if(order.error){ alert(order.error); return; }

  const options = {
    key: order.key_id,
    amount: order.amount,
    currency: order.currency,
    name: 'BIDA FOUNDATION',
    description: 'Donation',
    order_id: order.id,
    handler: async function (response){
      const verifyRes = await fetch(API + '/api/donate/verify', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature })
      });
      const verifyOut = await verifyRes.json();
      if(verifyOut.success){
        alert('Payment Verified!');
        document.getElementById('donationResult').style.display = 'block';
        document.getElementById('qrContainer').innerHTML = `<img src="${verifyOut.qr_data}" alt="qr" style="max-width:220px"/>`;
        document.getElementById('receiptLink').innerHTML = `<a href="${verifyOut.receipt_url}" target="_blank">Open / Download Receipt</a>`;
      } else {
        alert('Payment verification failed');
      }
    },
    theme: { color: '#8b1536' }
  };
  const rzp = new Razorpay(options);
  rzp.open();
});
