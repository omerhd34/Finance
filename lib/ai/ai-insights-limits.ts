/** Günlük AI analiz limiti. */
export const AI_LONG_REPORT_MAX_PER_DAY = 3;

/** Günde açılabilecek yeni IQfinansAI mesajlaşması  üst sınırı */
export const AI_ASSISTANT_MAX_CONVERSATIONS_PER_DAY = 5;

/** Tek mesajlaşmada en fazla bu kadar kullanıcı mesajı  */
export const AI_ASSISTANT_MAX_USER_MESSAGES_PER_CONVERSATION = 10;

/** İstek gövdesindeki mesaj listesi üst sınırı aşıldığında. */
export const AI_ASSISTANT_MESSAGE_LIMIT_REACHED_USER_MESSAGE =
  "Mesaj sınırına ulaştınız. Yeni bir mesajlaşma başlatın.";

/** Geçmişte tutulacak toplam tur (kullanıcı+asistan çifti) üst sınırı. */
export const AI_ASSISTANT_MAX_STORED_TURNS = 30;

/** İlk geçmiş yüklemesinde çekilecek tur sayısı (aynı listede birden fazla konuşma görünsün diye `AI_ASSISTANT_HISTORY_PAGE_SIZE` değerinden büyük tutulur; sunucu saklama sınırı ile hizalıdır. */
export const AI_ASSISTANT_HISTORY_INITIAL_FETCH = AI_ASSISTANT_MAX_STORED_TURNS;

/** "Diğerleri" ile yüklenecek ek tur sayısı. */
export const AI_ASSISTANT_HISTORY_PAGE_SIZE = 5;
