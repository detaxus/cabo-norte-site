import React, {useState} from 'react';

const LANGUAGE_OPTIONS = [
  'Português',
  'Inglês',
  'Espanhol',
];

const DISCOVERY_OPTIONS = [
  'Discord',
  'Facebook',
  'YouTube',
  'Fórum',
  'Indicação de outro cidadão',
  'Outra comunidade micronacional',
  'Pesquisa na internet',
  'Outro',
];

const PARTICIPATION_OPTIONS = [
  'Administração Pública',
  'Parlamento',
  'Justiça',
  'Guarda de Honra',
  'Guarda Cibernética de Cabo Norte',
  'Diplomacia',
  'Cultura e Comunidade',
  'Desenvolvimento Técnico',
  'Outro',
  'Nenhuma no momento',
];

const INITIAL_FORM = {
  fullName: '',
  publicName: '',
  email: '',
  discordUsername: '',
  languages: [],
  otherLanguages: '',
  hasMicronationCitizenship: '',
  micronationName: '',
  previousExperience: '',
  previousExperienceDetails: '',
  howFoundKingdom: '',
  howFoundOther: '',
  motivation: '',
  areasOfInterest: [],
  contribution: '',
  awareOfDuties: false,
  commitmentAccepted: false,
};

export default function CitizenshipApplicationForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  function updateField(event) {
    const {name, value, type, checked} = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));
  }

  function toggleArrayValue(name, value) {
    setForm((current) => {
      const currentValues = current[name] || [];

      if (value === 'Nenhuma no momento') {
        return {
          ...current,
          [name]:
            currentValues.includes(value)
              ? []
              : [value],
        };
      }

      return {
        ...current,
        [name]:
          currentValues.includes(value)
            ? currentValues.filter(
                (item) => item !== value
              )
            : [
                ...currentValues.filter(
                  (item) =>
                    item !== 'Nenhuma no momento'
                ),
                value,
              ],
      };
    });
  }

  function handleLanguageToggle(value) {
    toggleArrayValue('languages', value);
  }

  function handleAreaToggle(value) {
    toggleArrayValue('areasOfInterest', value);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch(
        'http://127.0.0.1:8787/application',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            ...form,
            languages:
              form.languages.join(', '),
            areasOfInterest:
              form.areasOfInterest.join(', '),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Não foi possível enviar a candidatura.'
        );
      }

      setStatus('success');

      setMessage(
        `Candidatura enviada com sucesso. Sua referência é ${data.applicationId}.`
      );

      setForm(INITIAL_FORM);

    } catch (error) {
      setStatus('error');

      setMessage(
        error.message ||
        'Não foi possível enviar a candidatura.'
      );
    }
  }

  const languageOtherSelected =
    form.languages.includes('Outro(s)');

  const discoveryOtherSelected =
    form.howFoundKingdom === 'Outro';

  const hasMicronation =
    form.hasMicronationCitizenship === 'Sim';

  const hasPreviousExperience =
    form.previousExperience === 'Sim';

  const hasParticipationOther =
    form.areasOfInterest.includes('Outro');

  return (
    <section className="cn-citizenship-application">

      <div className="cn-citizenship-application-header">

        <div className="cn-form-ornament">
          <span />
          <b>✦</b>
          <span />
        </div>

        <span className="cn-form-eyebrow">
          CITIZENSHIP
        </span>

        <h2>
          Formulário de Cidadania
        </h2>

        <p>
          A candidatura será analisada individualmente
          pelo Reino de Cabo Norte. O envio deste
          formulário não garante a admissão.
        </p>

      </div>

      <form
        className="cn-citizenship-form"
        onSubmit={handleSubmit}
      >

        <fieldset className="cn-form-group">
          <legend>
            Identificação
          </legend>

          <div className="cn-form-field">
            <label htmlFor="fullName">
              Nome completo
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={updateField}
              maxLength={160}
              autoComplete="name"
              required
            />
          </div>

          <div className="cn-form-field">
            <label htmlFor="publicName">
              Nome de uso em Cabo Norte
            </label>

            <span className="cn-form-help">
              Caso utilize um nome diferente do seu nome
              completo na comunidade, informe-o aqui.
            </span>

            <input
              id="publicName"
              name="publicName"
              type="text"
              value={form.publicName}
              onChange={updateField}
              maxLength={120}
              autoComplete="nickname"
            />
          </div>

          <div className="cn-form-field">
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              maxLength={254}
              autoComplete="email"
              required
            />
          </div>

          <div className="cn-form-field">
            <label htmlFor="discordUsername">
              Nome de usuário no Discord
            </label>

            <input
              id="discordUsername"
              name="discordUsername"
              type="text"
              value={form.discordUsername}
              onChange={updateField}
              maxLength={120}
              autoComplete="off"
              required
            />
          </div>
        </fieldset>

        <fieldset className="cn-form-group">
          <legend>
            Comunidade
          </legend>

          <div className="cn-form-field">
            <span className="cn-form-label">
              Idiomas que fala
            </span>

            <div className="cn-choice-grid">
              {LANGUAGE_OPTIONS.map(
                (language) => (
                  <label
                    className="cn-choice"
                    key={language}
                  >
                    <input
                      type="checkbox"
                      checked={form.languages.includes(
                        language
                      )}
                      onChange={() =>
                        handleLanguageToggle(
                          language
                        )
                      }
                    />

                    <span>
                      {language}
                    </span>
                  </label>
                )
              )}

              <label className="cn-choice">
                <input
                  type="checkbox"
                  checked={languageOtherSelected}
                  onChange={() =>
                    handleLanguageToggle(
                      'Outro(s)'
                    )
                  }
                />

                <span>
                  Outro(s)
                </span>
              </label>
            </div>
          </div>

          {languageOtherSelected && (
            <div className="cn-form-field">
              <label htmlFor="otherLanguages">
                Quais outros idiomas?
              </label>

              <input
                id="otherLanguages"
                name="otherLanguages"
                type="text"
                value={form.otherLanguages}
                onChange={updateField}
                maxLength={200}
              />
            </div>
          )}

          <div className="cn-form-field">
            <span className="cn-form-label">
              Como você conheceu o Reino de Cabo Norte?
            </span>

            <select
              name="howFoundKingdom"
              value={form.howFoundKingdom}
              onChange={updateField}
              required
            >
              <option value="">
                Selecione uma opção
              </option>

              {DISCOVERY_OPTIONS.map(
                (option) => (
                  <option
                    value={option}
                    key={option}
                  >
                    {option}
                  </option>
                )
              )}
            </select>
          </div>

          {discoveryOtherSelected && (
            <div className="cn-form-field">
              <label htmlFor="howFoundOther">
                Como você conheceu Cabo Norte?
              </label>

              <input
                id="howFoundOther"
                name="howFoundOther"
                type="text"
                value={form.howFoundOther}
                onChange={updateField}
                maxLength={300}
                required
              />
            </div>
          )}
        </fieldset>

        <fieldset className="cn-form-group">
          <legend>
            Experiência
          </legend>

          <div className="cn-form-field">
            <span className="cn-form-label">
              Você possui atualmente cidadania ou
              vínculo formal com outra micronação?
            </span>

            <div className="cn-choice-inline">
              <label className="cn-choice">
                <input
                  type="radio"
                  name="hasMicronationCitizenship"
                  value="Sim"
                  checked={
                    form.hasMicronationCitizenship ===
                    'Sim'
                  }
                  onChange={updateField}
                  required
                />

                <span>
                  Sim
                </span>
              </label>

              <label className="cn-choice">
                <input
                  type="radio"
                  name="hasMicronationCitizenship"
                  value="Não"
                  checked={
                    form.hasMicronationCitizenship ===
                    'Não'
                  }
                  onChange={updateField}
                />

                <span>
                  Não
                </span>
              </label>
            </div>
          </div>

          {hasMicronation && (
            <div className="cn-form-field">
              <label htmlFor="micronationName">
                Qual?
              </label>

              <input
                id="micronationName"
                name="micronationName"
                type="text"
                value={form.micronationName}
                onChange={updateField}
                maxLength={200}
                required
              />
            </div>
          )}

          <div className="cn-form-field">
            <span className="cn-form-label">
              Você já participou anteriormente de alguma
              micronação, comunidade política virtual ou
              projeto semelhante?
            </span>

            <span className="cn-form-help">
              Essa informação nos ajuda a compreender sua
              experiência e, quando necessário, adaptar
              sua acolhida e apresentação à vida do Reino.
              Caso esta seja sua primeira experiência, não
              há qualquer problema.
            </span>

            <div className="cn-choice-inline">
              <label className="cn-choice">
                <input
                  type="radio"
                  name="previousExperience"
                  value="Sim"
                  checked={
                    form.previousExperience ===
                    'Sim'
                  }
                  onChange={updateField}
                  required
                />

                <span>
                  Sim
                </span>
              </label>

              <label className="cn-choice">
                <input
                  type="radio"
                  name="previousExperience"
                  value="Não"
                  checked={
                    form.previousExperience ===
                    'Não'
                  }
                  onChange={updateField}
                />

                <span>
                  Não
                </span>
              </label>
            </div>
          </div>

          {hasPreviousExperience && (
            <div className="cn-form-field">
              <label htmlFor="previousExperienceDetails">
                Conte brevemente sobre essa experiência
              </label>

              <textarea
                id="previousExperienceDetails"
                name="previousExperienceDetails"
                value={
                  form.previousExperienceDetails
                }
                onChange={updateField}
                maxLength={2500}
                rows={6}
                required
              />
            </div>
          )}
        </fieldset>

        <fieldset className="cn-form-group">
          <legend>
            Motivação e participação
          </legend>

          <div className="cn-form-field">
            <label htmlFor="motivation">
              Por que você deseja se tornar cidadão(ã)
              do Reino de Cabo Norte?
            </label>

            <span className="cn-form-help">
              Responda brevemente, em uma ou duas frases.
            </span>

            <textarea
              id="motivation"
              name="motivation"
              value={form.motivation}
              onChange={updateField}
              maxLength={3000}
              rows={6}
              required
            />
          </div>

          <div className="cn-form-field">
            <span className="cn-form-label">
              Você tem interesse em participar ativamente
              de alguma área da vida do Reino?
            </span>

            <div className="cn-choice-grid">
              {PARTICIPATION_OPTIONS.map(
                (option) => (
                  <label
                    className="cn-choice"
                    key={option}
                  >
                    <input
                      type="checkbox"
                      checked={
                        form.areasOfInterest.includes(
                          option
                        )
                      }
                      onChange={() =>
                        handleAreaToggle(
                          option
                        )
                      }
                    />

                    <span>
                      {option}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          {hasParticipationOther && (
            <div className="cn-form-field">
              <label htmlFor="participationOther">
                Qual outra área?
              </label>

              <input
                id="participationOther"
                name="participationOther"
                type="text"
                value={
                  form.participationOther || ''
                }
                onChange={updateField}
                maxLength={200}
              />
            </div>
          )}

          <div className="cn-form-field">
            <label htmlFor="contribution">
              De que forma você gostaria de contribuir
              para o Reino?
            </label>

            <span className="cn-form-help">
              Você pode mencionar conhecimentos, habilidades,
              interesses, projetos ou simplesmente o tipo de
              participação que gostaria de desenvolver.
            </span>

            <textarea
              id="contribution"
              name="contribution"
              value={form.contribution}
              onChange={updateField}
              maxLength={3000}
              rows={6}
            />
          </div>
        </fieldset>

        <fieldset className="cn-form-group">
          <legend>
            Compromisso
          </legend>

          <label className="cn-confirmation">
            <input
              type="checkbox"
              name="awareOfDuties"
              checked={form.awareOfDuties}
              onChange={updateField}
              required
            />

            <span>
              Estou ciente de que a cidadania cabonortina
              implica o dever de conhecer e respeitar a
              Carta Fundamental, as leis do Reino e as
              normas legitimamente estabelecidas por suas
              instituições e espaços comunitários.
            </span>
          </label>

          <div className="cn-commitment">
            <strong>
              Declaração de compromisso
            </strong>

            <p>
              Ao enviar esta candidatura, declaro, sob minha
              honra, que as informações fornecidas são verdadeiras
              e que, caso admitido(a) como cidadão(ã),
              comprometo-me a respeitar a Carta Fundamental,
              as leis do Reino de Cabo Norte e as normas
              legitimamente estabelecidas por suas instituições
              e espaços comunitários.
            </p>
          </div>

          <label className="cn-confirmation">
            <input
              type="checkbox"
              name="commitmentAccepted"
              checked={
                form.commitmentAccepted
              }
              onChange={updateField}
              required
            />

            <span>
              Declaro estar de acordo.
            </span>
          </label>
        </fieldset>

        <button
          type="submit"
          className="cn-citizenship-submit"
          disabled={status === 'submitting'}
        >
          {status === 'submitting'
            ? 'Enviando…'
            : 'Enviar candidatura'}
        </button>

        {message && (
          <div
            className={`cn-form-message ${
              status === 'success'
                ? 'cn-form-success'
                : status === 'error'
                  ? 'cn-form-error'
                  : ''
            }`}
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}

      </form>

    </section>
  );
}
