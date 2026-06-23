'use client';

import { useState } from 'react';

const EMPTY = { name: '', company: '', email: '', phone: '', learnMore: false };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({
      ...f,
      [e.target.name]:
        e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus('success');
        setMessage(
          `Your bundle is on its way to ${form.email}. It should arrive in the next few minutes — if you don't see it, please check your spam or junk folder.`
        );
        setForm(EMPTY);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="rr-form-card">
      <h2 className="rr-form-title">Get instant access</h2>
      <p className="rr-form-subtitle">
        Fill out the form below and we'll send both presentation decks plus the
        updated Crypto Workflow toolkit straight to your inbox.
      </p>

      <form className="rr-form" onSubmit={handleSubmit} noValidate>
        <label className="rr-field">
          <span>
            Name <span className="rr-req">*</span>
          </span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            required
          />
        </label>

        <label className="rr-field">
          <span>
            Company <span className="rr-req">*</span>
          </span>
          <input
            type="text"
            name="company"
            autoComplete="organization"
            value={form.company}
            onChange={handleChange}
            placeholder="Your firm or practice"
            required
          />
        </label>

        <label className="rr-field">
          <span>
            Email <span className="rr-req">*</span>
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="rr-field">
          <span>
            Phone <span className="rr-req">*</span>
          </span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
            required
          />
        </label>

        <label className="rr-checkbox">
          <input
            type="checkbox"
            name="learnMore"
            checked={form.learnMore}
            onChange={handleChange}
          />
          <span>Yes, I'd like to learn more about RevRex.</span>
        </label>

        <button className="rr-submit" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Sending…' : 'Send Me the Bundle'}
        </button>

        {message && (
          <p className={`rr-message rr-message--${status}`} role="status" aria-live="polite">
            <span aria-hidden="true">{status === 'success' ? '✓' : '!'}</span>
            <span>{message}</span>
          </p>
        )}

        <p className="rr-fineprint">
          We respect your inbox. Your details are only used to deliver the bundle
          and occasional RevRex updates — unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
