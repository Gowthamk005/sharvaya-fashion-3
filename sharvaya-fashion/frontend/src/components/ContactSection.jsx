import { useState } from 'react';
import { sendContactMessage } from '../api/contact.js';
import { SITE } from '../data/siteInfo.js';
import './ContactSection.css';

const INITIAL = { name: '', email: '', phone: '', message: '', website: '' }; // website = hidden honeypot
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function ContactSection() {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [serverError, setServerError] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    if (status !== 'sending') setStatus('idle');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;

    const er = {};
    if (!values.name.trim()) er.name = 'Please enter your name';
    if (!emailOk(values.email.trim())) er.email = 'Enter a valid email address';
    if (values.phone.trim() && !/^[0-9+()\-\s]{7,20}$/.test(values.phone.trim())) {
      er.phone = 'Enter a valid phone number';
    }
    if (values.message.trim().length < 10) er.message = 'Tell us a little more (at least 10 characters)';
    setErrors(er);
    if (Object.keys(er).length) return;

    setStatus('sending');
    setServerError('');
    try {
      await sendContactMessage(values);
      setStatus('sent');
      setValues(INITIAL);
    } catch (err) {
      // Show the server's field messages next to the fields when it gives them
      const fieldErrors = Object.fromEntries((err.details || []).map((d) => [d.field, d.message]));
      setErrors(fieldErrors);
      setServerError(err.message);
      setStatus('error');
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="section-inner contact-grid">
        <div className="contact-info">
          <p className="eyebrow">Get in touch</p>
          <h2 className="section-title">Contact Us</h2>
          <p className="contact-lead">
            Questions about an order, a design or a custom fit? Send us a message and we will get back to you.
          </p>

          <ul className="contact-list">
            <li>
              <span className="contact-label">Visit</span>
              <span>
                {SITE.address.map((line) => (
                  <span key={line} className="contact-line">
                    {line}
                  </span>
                ))}
              </span>
            </li>
            <li>
              <span className="contact-label">Call</span>
              <a className="glow-link" href={`tel:${SITE.phone.replace(/\s/g, '')}`}>
                {SITE.phone}
              </a>
            </li>
            <li>
              <span className="contact-label">Email</span>
              <a className="glow-link" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
            </li>
            <li>
              <span className="contact-label">Hours</span>
              <span>{SITE.hours}</span>
            </li>
          </ul>
        </div>

        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="c-name">Your name</label>
            <input
              id="c-name"
              name="name"
              value={values.name}
              onChange={onChange}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="c-email">Email</label>
              <input
                id="c-email"
                name="email"
                type="email"
                value={values.email}
                onChange={onChange}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="field">
              <label htmlFor="c-phone">Phone (optional)</label>
              <input
                id="c-phone"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={onChange}
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="c-message">Message</label>
            <textarea
              id="c-message"
              name="message"
              rows="5"
              value={values.message}
              onChange={onChange}
              aria-invalid={Boolean(errors.message)}
            />
            {errors.message && <span className="field-error">{errors.message}</span>}
          </div>

          {/* Hidden from people; bots that fill every field reveal themselves */}
          <div className="hp-field" aria-hidden="true">
            <label htmlFor="c-website">Leave this empty</label>
            <input id="c-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={onChange} />
          </div>

          <button type="submit" className="contact-submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>

          {status === 'sent' && (
            <p className="contact-success" role="status">
              Thank you! Your message has been received.
            </p>
          )}
          {status === 'error' && serverError && (
            <p className="contact-error" role="alert">
              {serverError}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
